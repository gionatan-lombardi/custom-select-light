/*!
 * custom-select-light 
 * v1.0.0
 * (https://github.com/gionatan-lombardi/custom-select-light)
 * Copyright (c) 2016 Gionatan Lombardi
 * Licensed under the MIT license
 */

if (typeof jQuery === 'undefined') {
  throw new Error('Custom Select Light requires jQuery')
}

(function($) {

  'use strict';

  // Factory function
  // Thanx to Inferpse @ http://stackoverflow.com/questions/12880256/jquery-plugin-creation-and-public-facing-methods#answer-12880432
  function CustomSelectLight(item, options) {

      var self = this;

      // Extend the default options with those provided.
      self.options = $.extend( {}, $.fn.customSelectLight.defaults, options );
      self.$select = $(item);
      var searchTimeout, searchString = "";

      // Custom select: DOM element creation
      function customSelectCreation() {
        
        self.optionsData = {
          value: [],
          text: [],
          $items: [],
        };

        self.optgroups = {
        }

        // Wrap the select in an outer div 
        self.$select.wrap('<div class="cstSelContainer ' + self.options.containerClass + '"></div>')
        self.$container = self.$select.closest('.cstSelContainer');

        var optionsMarkup = "";

        // Gets the values and the text of each option
        self.$select.find('option').each(function(index, value) {
          // Stores the data only if the option has a value
          if ($(this).val() !== "") {
            self.optionsData.value.push($(this).val());
            self.optionsData.text.push($(this).text());
          }
        })

        // Gets the lables of the optgroups if present
        self.$select.find('optgroup').each(function(index, value) {
          // Stores the data only if the option has a value
          self.optgroups[$(this).attr('label')] = $('option', this).first().val();
        });

        // Creates the options HTML markup
        $.each(self.optionsData.value, function(index, value) {
          $.each(self.optgroups, function(key, v) {
            if (value === v)
              optionsMarkup += '<div class="cstSelOptgroup ' + self.options.optgroupClass + '"><span>' + key + '</span></div>';
          });
          optionsMarkup += '<div class="cstSelOption ' + self.options.optionClass + '" data-val="' + self.optionsData.value[index] + '"><span>' + self.optionsData.text[index] + '</span></div>';
        });

        // Creates the custom select HTML markup
        var customSelectMarkup = '<div class="cstSelPanel ' + self.options.panelClass + '">' + optionsMarkup + '</div>';

        // Writes the custom select opener before the select
        self.$select.before('<span class="cstSelOpener ' + self.options.openerClass + '" tabindex="0"><span></span></span>')
        
        // Writes the custom select HTML markup after the select
        self.$select.after(customSelectMarkup);

        // Stores new element in the main function vars
        self.$panel = $(".cstSelPanel", self.$container);
        self.$opener = $(".cstSelOpener", self.$container);
        self.$cstOptions = $(".cstSelOption", self.$container);
        
        // Stores all the custom options in a global var
        self.optionsData.$items = self.$cstOptions;

        // If there is a preselected option updates the opener text
        if (self.$select.find('option:selected').text() !== "") updateLabelText.call(self.$select);
      }

      // Open Panel
      function openPanel(e) {
        // Closes all opened panels
        $('.cstSelLabel').removeClass('is-active');
        $('.cstSelPanel').removeClass('is-open');

        // Opens only the clicked one
        self.$opener.addClass('is-active');
        self.$panel.addClass('is-open');

        // Sets the selected option
        setSelectedOption();
      }

      function closePanel() {
        self.$opener.removeClass('is-active');
        self.$panel.removeClass('is-open');
        self.$cstOptions.removeClass('has-focus');
      }

      function togglePanel(e) {
        if (!isOpen()) {
          openPanel(e);
        } else {
          closePanel();
        }
      }

      //  Sets the value from the custom select to the real select
      function setSelectValue(e) {
        // Get the value

        var val = $(this).data('val');
        // Gets the text
        var label = $(this).find('span').text()

        // Set the value to the hidden select
        // And triggers the change event for label text update
        self.$select.val(val).trigger("change");

        // Writes the value in the custom label
        self.$opener.find('span').text(label);

        // Closes the panel
        closePanel()

      }

      // On real select changes, updates the text of the label
      function updateLabelText() {
        self.$cstOptions.removeClass('is-selected');
        self.$cstOptions.filter(function(i, el){
          return $(el).attr("data-val") === self.$select.find('option:selected').val()
        }).addClass('is-selected');
        self.$opener.find('span').text(this.find('option:selected').text());
      }

      function setSelectedOption() {
        var $elem, elemIndex
        var value = self.$select.val();
        self.$cstOptions.each(function(index) {
          if ($(this).attr('data-val') === value) {
            $elem = $(this);
            elemIndex = index;
          }
        });
        if (typeof $elem !== 'undefined') setFocus($elem, elemIndex, true, false);
      }

      // Ouside panel closing function
      function outsideClosePanel(e) {
        if (
          !self.$opener.is(e.target) // the click is not on the opener
          && self.$opener.has(e.target).length === 0 // the click is not on a descendant of the opener
          && isOpen()
        ) {
          closePanel();
        }
      }

      // Keydown event handler
      function keydownPanelManager(e) {

        // WITH CLOSED PANEL
        if (!isOpen()) {

          // On "Arrow down" and "Space" keys opens the panel
          if (e.keyCode == 40) {
            e.preventDefault();
            openPanel(e);
          }

        }

        // WITH OPEN PANEL
        if (isOpen()) {

          // On "Enter"
          // If there's a focused option
          // sets the value from it
          if (e.keyCode == 13) {
            e.preventDefault();
            if ( self.$panel.find('.has-focus').length === 1 ) {
              setSelectValue.call(self.$panel.find('.has-focus'))
            }
          }
          
          // On "Escape" closes the panel
          if (e.keyCode == 27) {
            e.preventDefault();
            closePanel();
          }

          // On "Arrow Down" focuses the next option or the first
          if (e.keyCode == 40) {
            e.preventDefault();
            if (self.$panel.find('.cstSelOption.has-focus').length === 1) {
              var indexOfOption = self.$panel.find('.cstSelOption').index(self.$panel.find('.cstSelOption.has-focus')) + 1;
              var $toBeFocused = $(self.$panel.find('.cstSelOption').get(indexOfOption));
            } else {
              var $toBeFocused = $(self.$panel.find('.cstSelOption').get(0));
            }
            if ( $toBeFocused.length < 1 )
              var $toBeFocused = $(self.$panel.find('.cstSelOption').get(0));
            setFocus($toBeFocused, self.$cstOptions.index($toBeFocused), true, true);

            // On "Arrow Up" focuses the prev option
          } else if (e.keyCode == 38) {
            e.preventDefault();
            if (self.$panel.find('.has-focus').length === 1) {
              var indexOfOption = self.$panel.find('.cstSelOption').index(self.$panel.find('.cstSelOption.has-focus')) - 1
              var $toBeFocused = $(self.$panel.find('.cstSelOption').get(indexOfOption));
              setFocus($toBeFocused, self.$cstOptions.index($toBeFocused), true, true);
            }

            // Otherwise start the search/autocomplete function
          } else {
            if (typeof searchTimeout !== 'undefined') searchTimerClear(searchTimeout);
            searchTimer(1500);
            var result = searchInPanel(e)
            if (result !== false) setFocus(result.$elem, result.elemIndex, true, true);
          }

        }

        // ON RUNTIME CHECK

          // On "Space" keys opens the panel if closed
          // Otherwise if there's a focused option
          // sets the value from it
          if ( e.keyCode == 32 ) {
            e.preventDefault();
            ( function checkSetAndToggle (e) {
              if ( !isOpen() ) openPanel(e);
              else if ( self.$panel.find('.has-focus').length === 1 ) {
                setSelectValue.call(self.$panel.find('.has-focus'))
              }
            })(e);
          }

      }

      // Set the Focus state on the options
      function setFocus($elem, elemIndex, isMoving, isAnimated) {
        // Removes previous focused element
        self.$cstOptions.removeClass('has-focus');

        // Focuses the new element
        $elem.addClass('has-focus');

        // When move type is defined for keyboard control
        if (isMoving === true) {

          // If animation option is true
          var duration = isAnimated ? 100 : 0;

          // Set the Scrollbar position relative to the focused element
          var gotoPos = 0;
          $elem.prevAll().each(function() {
            gotoPos += $(this).outerHeight();
          });

          // Scrolls to the selected element
          // if plugin scrollToSelectd option is setted to true
          if (self.options.scrollToSelected) {
            self.$panel.stop().animate({
              scrollTop: gotoPos
            }, duration);
          }
        }
      }

      // Search/autocomplete function
      function searchInPanel(e) {
        // Only digits and letters allowed
        if (e.keyCode < 48 || e.keyCode > 90) return false;

        // Function private vars
        var $elem, elemIndex;

        // Translates the keycode to letter
        var currChar = String.fromCharCode(e.keyCode)

        // Adds the char to the search array
        searchString += currChar;

        // Search RegExp
        var searchRegExp = new RegExp("^" + searchString, "i");

        // Loops through the options values
        // to find a match with the searched string
        self.optionsData.text.every(function(value, index) {
          if (value.match(searchRegExp)) {
            $elem = $(self.optionsData.$items[index]);
            elemIndex = index;
            return false;
          }
          return true;
        })

        // If no element is found
        if (typeof $elem === 'undefined') return false;
        return {
          $elem: $elem,
          elemIndex: elemIndex
        }
      }

      // Timer for search string reset
      function searchTimer(ms) {
        searchTimeout = setTimeout(function() {
          searchString = "";
        }, ms);
      }

      function searchTimerClear(id) {
        clearTimeout(id);
      }

      // Utility function to check if the panel is open
      function isOpen() {
        if ( self.$panel.hasClass('is-open') ) return true;
        return false;
      }

      function init() {
        // Custom select creation
        customSelectCreation();
        // If the select is disables add a class
        // and skip event listeners adding
        if(self.$select.is("[disabled]")) {
          self.$container.addClass("is-disabled");
        } else {
          // Event listeners
          self.$opener.on("click.customSelect", togglePanel);
          self.$opener.on("keydown.customSelect", function(e) {
            keydownPanelManager(e);
          });
          self.$panel.on("click.customSelect", '.cstSelOption', setSelectValue);
          self.$panel.on("mouseover.customSelect", '.cstSelOption', function(e) {
            setFocus($(this));
          });
          self.$select.on('change.customSelect', function(e) {
            updateLabelText.call($(e.currentTarget));
          });
          $(document).on("click.customSelect", outsideClosePanel);
        }
      };

      init();
  }

  // Public Exposed Methods
  CustomSelectLight.prototype = {
    // Removes select options with the provided values: ['foo', 'buzz']
    // If undefined triggers the empty method
    remove: function remove(values) {
      var self = this;
      // check if the values are stored in an array
      if ($.isArray(values)) {
        values.forEach(function(value) {
          // If the options to remove is the currently selected
          // clears the select value and triggers the change event
          if (self.$select.val() === value) {
            self.$select.val('').trigger('change.customSelect');
          }
          // Removes the option
          self.$select.find('option[value="'+value+'"]').remove();
          // Removes the custom option
          self.$cstOptions.each(function() {
            if ($(this).attr('data-val') === value) $(this).remove();
          });
          // Removes the options-data used in the searchInPanel function
          var index = self.optionsData.value.indexOf(value);
          if (index > -1) {
            self.optionsData.value.splice(index, 1);
            self.optionsData.text.splice(index, 1);
            self.optionsData.$items.splice(index, 1);
          }
        });
      } else if (typeof values === 'undefined') {
        self.empty();
      }
    },
    // Clears all the options
    // and resets all the options-data used in the searchInPanel function
    empty: function empty() {
      this.$select.find('option:not([value=""])').remove();
      this.$cstOptions.remove();
      this.$select.val('').trigger('change.customSelect');
      this.optionsData = {
        value: [],
        text: [],
        $items: []
      };
    },
    // Adds new options to the select: [ ['liz', 'Liz'], ['nuts', 'Nuts'] ]
    add: function add(elements) {
      var self = this;
      var optionsMarkup = "";
      var cstOptionsMarkup = "";
      if ($.isArray(elements)) {
        elements.forEach(function(el) {
          // Creates the markup string
          optionsMarkup += '<option value="' + el[0] + '">' + el[1] + '</option>';
          cstOptionsMarkup += '<div class="cstSelOption ' + self.options.optionClass + '" data-val="' + el[0] + '"><span>' + el[1] + '</span></div>';
          // Populates the options-data with the new values and texts
          self.optionsData.value.push(el[0]);
          self.optionsData.text.push(el[1]);
        });
        // Appens the new DOM elements
        self.$select.append(optionsMarkup);
        self.$panel.append(cstOptionsMarkup);
        // Updates the custom options used globally in the scope
        self.optionsData.$items = self.$cstOptions = $(".cstSelOption", self.$container);
      }
    }
  }

  $.fn.customSelectLight = function( opt ) {

    // slice arguments to leave only arguments after function name
    var args = Array.prototype.slice.call(arguments, 1);
    
    return this.each( function () {

      var item = $(this);
      var instance = item.data('CustomSelectLight');
      
      if(!instance) {
        // create plugin instance and save it in data
        item.data('CustomSelectLight', new CustomSelectLight(this, opt));
      } else {
        // if instance already created call method
        if(typeof opt === 'string') {
            instance[opt].apply(instance, args);
        }
      }

    });

  };

  // Default Plugin Options
  $.fn.customSelectLight.defaults = {
    panelClass: 'custom-select-panel',
    optionClass: 'custom-select-option',
    optgroupClass: 'custom-select-optgroup',
    openerClass: 'custom-select-opener',
    containerClass: 'custom-select-container',
    scrollToSelected: true
  };

})(jQuery);