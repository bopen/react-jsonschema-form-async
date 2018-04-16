# React JSON Schema Async Form

A wrapper for [react-jsonschema-form](https://github.com/mozilla-services/react-jsonschema-form) which add asynchronous validation capabilities.

[![Build Status](https://travis-ci.org/bopen/react-jsonschema-form-async.svg?branch=master)](https://travis-ci.org/keul/react-jsonschema-form-async)
[![Dependencies](https://img.shields.io/david/keul/react-jsonschema-form-async.svg)]()
[![Dev Dependencies](https://img.shields.io/david/dev/keul/react-jsonschema-form-async.svg)]()

## Motivation behind this library

`react-jsonschema-form` is an excellent library, but for many reason it doesn't cover the async validation.

There's work in progress about this (see [here](https://github.com/mozilla-services/react-jsonschema-form/issues/155)) so maybe in future this library will not be useful anymore.

## Know/unknow issues and TODO

I'm pretty sure this library does not cover every usecase:

- [x] supporting basic async validation
- [x] should [onSubmit](https://github.com/mozilla-services/react-jsonschema-form#form-submission) be called with a server response instead of `formData` submitted?
- [ ] testing with [onChange](https://github.com/mozilla-services/react-jsonschema-form#form-data-changes)
- [ ] testing with [liveValidate](https://github.com/mozilla-services/react-jsonschema-form#live-validation)
- [ ] testing with [noValidate](https://github.com/mozilla-services/react-jsonschema-form#html5-validation)
- [x] testing with [onError](https://github.com/mozilla-services/react-jsonschema-form#form-error-event-handler)
- [ ] different endpoints for validation and submit? Make any sense?

**Contributions are welcome!**

## How to use

### Installation

```
npm install --save react-jsonschema-form-async
```

You will also need `react-jsonschema-form` as peer dependency.

### Example

Live example at https://bopen.github.io/react-jsonschema-form-async

```javascript

import Form from 'react-jsonschema-form-async';

const App = (props) => (
  <Form
    schema={yourSchema}
    onAsyncValidate={asyncValidate}
    onSubmit={handleSubmit}
    onError={handleError}
  />    
)
```

Note that:

* you will import and use the `Form` component from `react-jsonschema-form-async` instead of the one  from `react-jsonschema-form`.
* the [onSubmit](https://github.com/mozilla-services/react-jsonschema-form#form-submission) prop has a similar format/signature of the original library, but probably you will not use it for call an API to store data on a backend (see below).
  The object passed can also contains a `result` entry, which can be the whole success response.
* the [onError](https://github.com/mozilla-services/react-jsonschema-form#form-error-event-handler) receive two parameters: the (standard) `errors` array *and* the parameter and the reject reason (commonly an exception in case of promises).
* `onAsyncValidate` is the only new props you need to care about.

The `onAsyncValidate` function is called when the form is submitted, so it receives the `formData` object as parameter.

It must return a Promise or promise-like object:

* if the promise resolves, `onSubmit` is called (if provided).
* if the promise is rejected, is must contains a JSON structure where error messages are stored and `onError` in called (is provided).

An example of `onAsyncValidate`:

```javascript

const asyncValidate = (formData) => {
  return api.post('/api/v1/create', formData);
}
```

In case of errors this API post should return a failure JSON response with an `errors` entry (by default).
An example:

```json
{
  "errors": {
    "username": "The username is already used",
    "birthday": "The date is invalid"
  }
}
```

An `onSubmit` implementation can be:

```javascript
const onSubmit = ({formData, result}) => {
  // formData works the same as in react-jsonschema-form
  // result depends on your Promise implementation, commonly it can be the whole JSON response
}
```

An `onError` implementation can be:

```javascript
const onError = (errors, err) => {
  // errors works the same as in react-jsonschema-form (array of errors)
  // err depends on your Promise implementation, commonly it is an exception passed when rejecting
}
```

**Note**: `onError` is called also when default client side validations fails, so the latter parameter is not always present.

#### Custom JSON response

If you can't control your JSON response format and your error messages are stored differently, you can change the default `errorsAccessor` props (default is *"errors"*).

For example:

```jsx
  <Form
    schema={yourSchema}
    onAsyncValidate={asyncValidate}
    onSubmit={handleSubmit}
    errorsAccessor="json[1].errorMessages"
  />
```

See [lodash get syntax](https://lodash.com/docs/#get).

### About `onSubmit` usage

If you are interacting with a remote server, validation is commonly performed during the attempt to store data to the server so `onAsyncValidate` is probably the only prop you need to interact with the server.
For this reason the `onSubmit` prop is less important, you can use it for updating local state, if needed.
