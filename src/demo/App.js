/* eslint-disable no-console */
import React, { Component, Fragment } from 'react';
import Form from '../lib';

const getSchema = (data) => ({
  type: 'object',
  required: ['field_a', 'field_b'],
  properties: {
    field_a: { type: 'string', title: 'Field A', default: data.field_a },
    field_b: {
      type: 'string',
      title: 'Field B',
      description: 'Type same data as "Field A" but uppercase (this is validated asynchronously)',
      default: data.field_b,
    },
    field_c: {
      type: 'integer',
      title: 'Field C',
      description: 'Type an even number (this is checked by a classical client-side validation)',
      default: data.field_c,
    },
  },
});

const validate = (formData, errors) => {
  if (formData.field_c % 2 > 0) {
    errors.field_c.addError('Please provide only even numbers');
  }
  return errors;
};

export const delay = (ms) => {
  let ctr;
  let rej;
  const p = new Promise((resolve, reject) => {
    ctr = setTimeout(resolve, ms);
    rej = reject;
  });
  p.cancel = () => {
    clearTimeout(ctr);
    rej(Error('Cancelled'));
  };
  return p;
};

class App extends Component {
  state = { typedData: {}, submittedData: {}, loading: false };

  handleSubmit = ({ formData, result }) => {
    this.setState({ submittedData: formData });
    console.log(result);
  };

  handleError = (errors, err) => {
    console.log(errors, err);
  };

  asyncValidate = (formData) =>
    new Promise((resolve, reject) => {
      this.setState({ loading: true, typedData: formData });
      delay(2000).then(() => {
        if (formData.field_b !== formData.field_a.toUpperCase()) {
          const err = new Error('Validation error');
          err.errors = { field_b: `"Field B" should be ${formData.field_a.toUpperCase()}` };
          reject(err);
          return;
        }
        resolve('Success result');
      });
    }).finally(() => {
      this.setState({ loading: false });
    });

  render() {
    const { typedData, submittedData, loading } = this.state;
    return (
      <Fragment>
        <Form
          schema={getSchema(typedData)}
          validate={validate}
          noHtml5Validate
          onAsyncValidate={this.asyncValidate}
          onSubmit={this.handleSubmit}
          onError={this.handleError}
        />
        <hr />
        <h3>Last submitted data:</h3>
        {loading ? (
          <div className="progress">
            <div
              className="progress-bar progress-bar-striped active"
              role="progressbar"
              aria-valuenow="50"
              aria-valuemin="0"
              aria-valuemax="100"
              style={{ width: '50%' }}
            >
              <span className="sr-only">Doing...</span>
            </div>
          </div>
        ) : (
          <ul>
            {Object.entries(submittedData).map((item) => (
              <li key={item[0]}>{`${item[0]}: ${item[1]}`}</li>
            ))}
          </ul>
        )}
      </Fragment>
    );
  }
}

export default App;
