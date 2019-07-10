<!-- ignore -->
# Responsive Containers
<!-- /ignore -->

## Description

[CSS media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries) let us style elements based on the size of the screen. What if we wanted to style them based on the size of their **container**? A widget or block should often look different if it's full-width or constrained within a column or sidebar, but we didn't have any way to write **container queries** to style those elements based on their on-screen width&hellip; until now!

<!-- ignore -->
![Philip Walton's "Calendar" responsive components demo](./docs/images/responsive-components-calendar-demo.gif)
_[Calendar demo from Philip Walton's Responsive Components demo site](https://philipwalton.github.io/responsive-components/#calendar)_
<!-- /ignore -->

This plugin loads a small JavaScript file that conditionally applies classes to elements based on how wide those elements are in the browser. This can be used by other themes and plugins to write container-specific styles for editor blocks or widgets, so that they will display correctly wherever they are placed in the page.

The script works on the frontend and in the block editor — see your responsive styles live while you're composing your post, and trust that your widgets and blocks will look their best whether they're full-width or in the narrowest sidebar.

### Usage

If you have a block or widget in your site that you wish to use as a responsive container, add the `data-responsive-container` attribute to that block's container element. For example, the parent `<div>` for a calendar block might look like this:

```html
<div class="calendar-block" data-responsive-container>
```

With just that and nothing more, your container will now be tagged with additional classes based on how big they appear:
- `container-sm` if the container is 519px wide or less,
- `container-md` if it is between 520px and 899px wide,
- `container-lg` if it is between 900px and 1279px wide, and
- `container-xl` for any element 1280px or wider.

These default values are by definition somewhat arbitrary, so you may also provide your own custom theme- or plugin-specific breakpoint values using the `data-responsive-container` attribute. When rendering your element or block in PHP, pass an array of **class names** and the **minimum width** at which they should be applied. These class names can be generic like the `.container-*` classes used by default, or they may be specific to the element being styled:

```php
echo sprintf(
  '<div class="myblock" data-responsive-container="%s">',
  // responsive_container_breakpoints() calls esc_attr internally.
  responsive_container_breakpoints( [
    'myblock--2-column' => 600,
    'myblock--3-column' => 900,
  ] )
);
```

Using this example your container would receive the `.myblock--2-column` class from 600px to 899px, and `.myblock--3-column` at or above 900px.

Note that in this case the `.myblock` element receives no custom class below 600px. We don't apply any class names below your specified minimum because we assume styles are written mobile-first, but you may ensure your smallest class is always applied by providing a minimum width of `0`.

## Frequently Asked Questions

### How does this work?

The Responsive Containers plugin implements an approach popularized by [Philip Walton's excellent article _Responsive Components: a Solution to the Container Queries Problem_](https://philipwalton.com/articles/responsive-components-a-solution-to-the-container-queries-problem/). What this plugin does is apply his solution to WordPress sites so that, assuming this plugin is installed, any other plugin or theme can opt-in to responsive container styling.

Under the hood this is all driven by [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver), a new browser feature that efficiently detects element size changes. We use this method to track the size of specific containers on the page and apply a set of classes to those elements based on how big they appear on the screen.

### I activated this plugin and nothing changed!

Installing and activating this plugin will not change anything about your site on its own. You have to update your theme or plugin to add the `data-responsive-containers` HTML attribute to any elements you wish to use as responsive containers

## Changelog

### 1.0
* Loads `responsive-containers.js` to observe and decorate `data-responsive-container` elements.
* Introduces `responsive_container_breakpoints()` method to render a stringified & attribute-escaped custom breakpoints array.

## License & Attribution

This plugin is licensed under the terms of the [GNU General Public License](./license.txt) (or "GPL"). It is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 2 of the License, or (at your option) any later version.

It was created by K. Adam White at [Human Made](https://humanmade.com), based on a concept popularized by [Philip Walton](https://philipwalton.com/).

This plugin utilizes the [`resize-observer-polyfill` library](https://www.npmjs.com/package/resize-observer-polyfill) by Denis Rul, released under the MIT license and &copy; 2016 Denis Rul.

