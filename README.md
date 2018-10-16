# react-galaxy v0.1.0

Powered by [TypeScript](https://github.com/Microsoft/TypeScript) and [immer][immer].

Do you like ["render props"](https://reactjs.org/docs/render-props.html), but hate ["callback hell"](http://callbackhell.com/)? Try [yender](https://github.com/aleclarson/yender) with react-galaxy.

[immer]: https://github.com/mweststrate/immer

&nbsp;

---

&nbsp;

### Reactive selectors

["Selectors"](https://react-galaxy.github.io/#/#selectors) are functions that take some arguments (often observable) and return some value (which is then deep frozen). The return value is provided to a React component (using render props) or another selector (using the [`derive`](https://react-galaxy.github.io/#/#derive) function).

The ["reactive"](https://react-galaxy.github.io/#/#track) part means anything a selector accesses (from its arguments or [any galaxy](https://react-galaxy.github.io/#/#galaxy-selection)) is observed whenever possible. Every time an observed value changes, the selector is called. Every time the selector returns a value that's different from its previous return value, anything observing the selector is notified.

&nbsp;

---

&nbsp;

### Observable _and_ immutable? What?

Whenever [immer][immer] copies an immutable object, Galaxy notifies the observable object, which then calls its observers. An object **must** be made observable before being frozen, and our [`track`](https://react-galaxy.github.io/#/#track) function does both for you.

The observable object always points to the newest copy of the "base state" (which is whatever object you passed to `track`). This means you get the power of _immutability_ **and** _observability_.

The `track` function always returns the same value you passed in. All it does is tag the given value and any nested objects/arrays with observable objects.

&nbsp;

---

&nbsp;

### _But wait,_ there's more! **The [guide](https://react-galaxy.github.io) is a must-read.**

Contributors wanted!

&nbsp;

```
MIT License

Copyright (c) Alec Larson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
