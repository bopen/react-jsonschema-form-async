import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BaseForm from 'react-jsonschema-form';

const nop = () => {};

class Form extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
    errorsAccessor: PropTypes.string,
    onSubmit: PropTypes.func,
    onError: PropTypes.func,
    onAsyncValidate: PropTypes.func.isRequired,
  };

  static defaultProps = {
    children: null,
    onSubmit: nop,
    onError: nop,
    errorsAccessor: 'errors',
  };

  fillFormErrors = (validationErrors) => {
    if (!validationErrors) {
      console.error('Errors has not been found');
      return;
    }
    const { errorSchema } = this.form.state;
    const newErrorSchema = cloneDeep(errorSchema);
    const newErrors = [];
    Object.entries(validationErrors).map(([key, msg]) => {
      newErrorSchema[key] = { __errors: [msg] };
      newErrors.push({ stack: `${key}: ${msg}` });
    });
    this.form.setState({ errorSchema: newErrorSchema, errors: newErrors });
  };

  handleSubmit = ({ formData }) => {
    const {
      onSubmit, onError, errorsAccessor, onAsyncValidate,
    } = this.props;
    this.form.setState({ errors: [], errorSchema: {} });
    onAsyncValidate(formData)
      .then((result) => {
        this.form.setState({ errors: [], errorSchema: {} });
        onSubmit({ formData, result });
      })
      .catch((err) => {
        const errors = get(err, errorsAccessor);
        if (process.env.NODE_ENV !== 'production') {
          console.error(err, errors);
        }
        this.fillFormErrors(errors);
        onError(errors, err, formData);
      });
  };

  render() {
    const {
      children, errorsAccessor, onSubmit, ...other
    } = this.props;
    return (
      <BaseForm
        ref={(input) => {
          this.form = input;
        }}
        onSubmit={this.handleSubmit}
        {...other}
      >
        {children}
      </BaseForm>
    );
  }
}

export default Form;
