import { useState } from 'react';

export const useFormValidation = (initialState) => {
  const [errors, setErrors] = useState({});

  const validateForm = (values) => {
    const newErrors = {};

    // Name validation
    if (!values.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!values.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(values.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Subject validation
    if (!values.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    // Message validation
    if (!values.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (values.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, validateForm };
};