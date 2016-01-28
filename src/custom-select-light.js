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

  $.fn.customSelectLight = function( options ) {
   
    var self = this;
    // Extend our default options with those provided.
    self.opts = $.extend( {}, $.fn.customSelectLight.defaults, options );

    this.each( function () {

      console.log(self.opts);
      var $select = $(this);
      var $container, $opener, $panel, $cstOption, optionsData, searchTimeout, searchString = "";

      // Custom select: DOM element creation
      function customSelectCreation() {
        
        optionsData = {
          value: [],
          text: [],
          $items: []
        };

        // Wrap the select in an outer div
        $select.wrap('<div class="cstSelContainer ' + self.opts.containerClass + '"></div>')
        $container = $select.closest('.cstSelContainer');


        var optionsMarkup = "";

        // Gets the values and the text of each option
        $select.find('option').each(function(index, value) {
          // Stores the data only if the option has a value
          if ($(this).val() !== "") {
            optionsData.value.push($(this).val());
            optionsData.text.push($(this).text());
          }
        })

        // Creates the options HTML markup
        for (var i = 0; i < optionsData.value.length; i++) {
          optionsMarkup += '<div class="cstSelOption ' + self.opts.optionClass + '" data-val="' + optionsData.value[i] + '"><span>' + optionsData.text[i] + '</span></div>';
        };

        // Creates the custom select HTML markup
        var customSelectMarkup = '<div class="cstSelPanel ' + self.opts.panelClass + '">' + optionsMarkup + '</div>';

        // Writes the custom select opener before the select
        $select.before('<span class="cstSelOpener ' + self.opts.openerClass + '" tabindex="0"><span></span></span>')
        
        // Writes the custom select HTML markup after the select
        $select.after(customSelectMarkup);

        // Stores new element in the main function vars
        $panel = $(".cstSelPanel", $container);
        $opener = $(".cstSelOpener", $container);
        $cstOption = $(".cstSelOption", $container);
        
        // Stores all the custom options in a global var
        optionsData.$items = $cstOption;

        // If there is a preselected option updates the label
        if ($select.find('option:selected').text() !== "") updateLabelText.call($select);
      }

      // Open Panel
      function openPanel(e) {
        // Closes all opened panels
        $('.cstSelLabel').removeClass('is-active');
        $('.cstSelPanel').removeClass('is-open');

        // Opens only the clicked one
        $opener.addClass('is-active');
        $panel.addClass('is-open');

        setSelectedOption();

        // Prevents document.click event fireing
        e.stopPropagation();
      }

      // Close Panel
      function closePanel() {
        $opener.removeClass('is-active');
        $panel.removeClass('is-open');
        $cstOption.removeClass('has-focus');
      }

      function togglePanel(e) {
        if (!$panel.hasClass('is-open')) {
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
        $select.val(val).trigger("change");

        // Writes the value in the custom label
        $opener.find('span').text(label);

        // Closes the panel
        closePanel()

      }

      // On real select changes, updates the text of the label
      function updateLabelText() {
        $opener.find('span').text(this.find('option:selected').text());
      }

      function setSelectedOption() {
        var $elem, elemIndex
        var value = $select.val();
        $cstOption.each(function(index) {
          if ($(this).attr('data-val') === value) {
            $(this).addClass('has-focus');
            $elem = $(this);
            elemIndex = index;
          }
        });
        if (typeof $elem !== 'undefined') setFocus($elem, elemIndex, true, false);
      }

      // Ouside panel closing function
      function outsideClosePanel(e) {
        if (!$panel.is(e.target) // the click is not on the select
          && $panel.has(e.target).length === 0 // the click is not on a descendant of the select
          && $panel.hasClass('is-open')
        ) {
          closePanel();
        }
      }

      // Keydown event handler
      function keydownPanelManager(e) {

        // On "Space" key 
        // On "Arrow Down" key when panel is closed, 
        // Opens the Custom Select
        if (e.keyCode == 32 || (e.keyCode == 40 && !$panel.hasClass('is-open'))) {
          e.preventDefault();
          togglePanel(e);
        }

        // On "Enter" key
        if (e.keyCode == 13) {
          e.preventDefault();
          // If the panel is open
          // and there's a focused option
          // set the value from the focused option
          if ($panel.hasClass('is-open') && $panel.find('.has-focus').length === 1) {
            setSelectValue.call($panel.find('.has-focus'))
          }
        }

        // Only when the panel is open
        if ($panel.hasClass('is-open')) {

          // On "Arrow Down" focuses the next option or the first
          if (e.keyCode == 40) {
            e.preventDefault();
            if ($panel.find('.has-focus').length === 1) {
              var $toBeFocused = $panel.find('.has-focus').next()
            } else {
              var $toBeFocused = $cstOption.first();
            }
            setFocus($toBeFocused, $cstOption.index($toBeFocused), true, true);

            // On "Arrow Up" focuses the prev option
          } else if (e.keyCode == 38) {
            e.preventDefault();
            if ($panel.find('.has-focus').length === 1) {
              var $toBeFocused = $panel.find('.has-focus').prev();
              setFocus($toBeFocused, $cstOption.index($toBeFocused), true, true);
            }

            // Otherwise start the search/autocomplete function
          } else {
            if (typeof searchTimeout !== 'undefined') searchClearTimer(searchTimeout);
            searchTimer(1500);
            var result = searchInPanel(e)
            if (result !== false) setFocus(result.$elem, result.elemIndex, true, true);
          }
        }
      }

      // Set the Focus state on the options
      function setFocus($elem, elemIndex, isMoving, isAnimated) {
        // Removes previous focused element
        $cstOption.removeClass('has-focus');

        // Focuses the new element
        $elem.addClass('has-focus');

        // When move type is defined for keyboard control
        if (isMoving === true) {

          // If animation option is true
          var duration = isAnimated ? 100 : 0;

          // Set the Scrollbar position relative to the focused element
          var gotoPos = $elem.height() * elemIndex;
          $panel.stop().animate({
            scrollTop: gotoPos
          }, duration);
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

        // Loops throught the options values
        // to find a match with the searched string
        optionsData.value.every(function(value, index) {
          if (value.match(searchRegExp)) {
            $elem = $(optionsData.$items[index]);
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

      function searchTimer(ms) {
        searchTimeout = setTimeout(function() {
          searchString = "";
        }, ms);
      }

      function searchClearTimer(id) {
        clearTimeout(id);
      }

      // Public function
      function init() {
        // Custom select creation
        customSelectCreation();
        // Event listeners
        $opener.on("click.customSelect", togglePanel);
        $opener.on("keydown.customSelect", function(e) {
          keydownPanelManager(e);
        });
        $cstOption.on("click.customSelect", setSelectValue);
        $cstOption.on("mouseover.customSelect", function(e) {
          setFocus($(this));
        });
        $select.on('change.customSelect', function(e) {
          updateLabelText.call($(e.currentTarget));
        });
        $(document).on("click.customSelect", outsideClosePanel);
      };

      init();

    });

  };

  // Default options
  $.fn.customSelectLight.defaults = {
    panelClass: 'custom-select-panel',
    optionClass: 'custom-select-option',
    openerClass: 'custom-select-opener',
    containerClass: 'custom-select-container'
  };

})(jQuery);