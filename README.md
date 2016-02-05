# custom-select-light
A lightweight JS script for custom select creation. Requires jQuery.

## How it works
Start with a simple select:
```html
<select id="mySelect">
    <option value>Select...</option>
    <option value="foo">Foo</option>
    <option value="buzz">Buzz</option>
</select>
```
With JS simply apply the plugin to your select:
```javascript
$('#mySelect').customSelectLight()
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
