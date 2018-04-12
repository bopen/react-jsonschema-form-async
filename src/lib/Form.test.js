/* eslint-disable prefer-promise-reject-errors */
import React from 'react';
import { render, Simulate, wait } from 'react-testing-library';
import 'dom-testing-library/extend-expect';

import { delay } from '../demo/App';

import Form from './Form';

const schema = {
  title: 'Test form',
  type: 'object',
  required: ['field_a'],
  properties: {
    field_a: { type: 'string', title: 'Field A' },
    field_b: { type: 'string', title: 'Field B' },
  },
};

const validate = () =>
  new Promise((resolve, reject) => {
    delay(500).then(() => {
      reject({ errors: { field_a: 'Rejected by the server' } });
    });
  });

const validateNested = () =>
  new Promise((resolve, reject) => {
    delay(500).then(() => {
      reject({ foo: [null, { field_a: 'Rejected again' }] });
    });
  });

it('Form renders without crashing', () => {
  const { getByText } = render(<Form schema={schema} onAsyncValidate={validate} />);
  expect(getByText('Test form').textContent).toBe('Test form');
});

it('Works normally with native validation', () => {
  const { container } = render(<Form schema={schema} onAsyncValidate={validate} />);
  Simulate.submit(container.querySelector('form'));
  expect(container.querySelector('.list-group-item').textContent).toBe('.field_a is a required property');
});

it('Testing async validation with native validation', async () => {
  const { getByLabelText, container } = render(<Form schema={schema} onAsyncValidate={validate} />);
  const fieldA = getByLabelText('Field A');
  fieldA.value = 'something';
  Simulate.change(fieldA);
  Simulate.submit(container.querySelector('form'));
  await wait(() => container.querySelector('.list-group-item').length > 1);
  expect(container.querySelector('.list-group-item').textContent).toBe('field_a: Rejected by the server');
});

it('Nested error object', async () => {
  const { getByLabelText, container } = render(<Form schema={schema} onAsyncValidate={validateNested} errorsAccessor="foo[1]" />);
  const fieldA = getByLabelText('Field A');
  fieldA.value = 'something';
  Simulate.change(fieldA);
  Simulate.submit(container.querySelector('form'));
  await wait(() => container.querySelector('.list-group-item').length > 1);
  expect(container.querySelector('.list-group-item').textContent).toBe('field_a: Rejected again');
});
