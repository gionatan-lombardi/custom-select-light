# custom-select-light
A lightweight jQuery plugin for custom select creation.

## No more supported
This plugin was totally rewritten and finally **custom-select has born**!
(View on github](https://github.com/custom-select/custom-select).
(View on npmjs](https://www.npmjs.com/package/custom-select).

**custom-select-light is no more supported.**

## How it works
Start with a simple select:
```html
<select id="mySelect">
    <option value>Select...</option>
    <option value="foo">Foo</option>
    <option value="buzz">Buzz</option>
</select>
```
**Important**: Don't nest the select inside a label, use instead the `for` attribute in the label

With jQuery simply apply the plugin to your select:
```javascript
$('#mySelect').customSelectLight();
```

Here's the HTML result:
```html
<div class="cstSelContainer custom-select-container">
    <span class="cstSelOpener custom-select-opener" tabindex="0">
        <span>Select ...</span>
    </span>
    <select id="mySelect">
        <option value>Select...</option>
        <option value="foo">Foo</option>
        <option value="buzz">Buzz</option>
    </select>
    <div class="cstSelPanel custom-select-panel">
        <div class="cstSelOption custom-select-option" data-val="foo"><span>Foo</span></div>
        <div class="cstSelOption custom-select-option" data-val="buzz"><span>Buzz</span></div>
    </div>
</div>
```
The `<select>`'ll be wrapped in a div `.cstSelContainer`, an opener `.cstSelOpener` and a panel `.cstSelPanel`, will'be created, with the cloned options from the original `<select>`.

That's all! Show, hide and styles will'be managed via css.

**And now have fun.**

## Options

### panelClass
Type: `string`

Default: `custom-select-panel`

### optionClass
Type: `string`

Default: `custom-select-option`

### openerClass
Type: `string`

Default: `custom-select-opener`

### containerClass
Type: `string`

Default: `custom-select-container`

### scrollToSelected
Type: `boolean`

Default: `true`

Sometimes it is useful to skip the scroll to setted element function, to avoid some unwanted css animations behaviours, especially when the panel has an `absolute` position.

## Methods
To use the plugin public methods:  
`$(selector).customSelectLight( methodName [, ...arguments])`

### 'remove'
Argument: `Array`

Usage: `$('#mySelect').customSelectLight('remove', ['foo', 'bazz']);`

Removes the select's options that have the value provided.
If no argument is given triggers the 'empty' method.

### 'empty'
Argument: none

Usage: `$('#mySelect').customSelectLight('empty')`

Removes all the select's options.

### 'add'
Argument: `2D Array`

Usage: `$('#mySelect').customSelectLight('add', [['liz','Liz'],['nut','Nut']])`

Adds new options to the select.  
The first element of the argument's array is the **value**, the second is the **label**
