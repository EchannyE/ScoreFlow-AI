function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validateField(fieldName, fieldDefinition, value) {
  const errors = [];

  if (fieldDefinition.type === 'string') {
    if (typeof value !== 'string') {
      errors.push(`${fieldName} must be a string.`);
      return errors;
    }

    if (fieldDefinition.minLength && value.trim().length < fieldDefinition.minLength) {
      errors.push(`${fieldName} must be at least ${fieldDefinition.minLength} characters.`);
    }

    if (fieldDefinition.pattern && !fieldDefinition.pattern.test(value)) {
      errors.push(`${fieldName} is not in the expected format.`);
    }
  }

  if (fieldDefinition.type === 'number') {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      errors.push(`${fieldName} must be a valid number.`);
      return errors;
    }

    if (fieldDefinition.minimum !== undefined && value < fieldDefinition.minimum) {
      errors.push(`${fieldName} must be greater than or equal to ${fieldDefinition.minimum}.`);
    }

    if (fieldDefinition.maximum !== undefined && value > fieldDefinition.maximum) {
      errors.push(`${fieldName} must be less than or equal to ${fieldDefinition.maximum}.`);
    }
  }

  if (fieldDefinition.type === 'boolean' && typeof value !== 'boolean') {
    errors.push(`${fieldName} must be a boolean.`);
  }

  if (fieldDefinition.type === 'array') {
    if (!Array.isArray(value)) {
      errors.push(`${fieldName} must be an array.`);
      return errors;
    }

    if (fieldDefinition.itemType) {
      const hasInvalidItem = value.some((item) => typeof item !== fieldDefinition.itemType);
      if (hasInvalidItem) {
        errors.push(`${fieldName} must only contain ${fieldDefinition.itemType} values.`);
      }
    }
  }

  if (fieldDefinition.enum && !fieldDefinition.enum.includes(value)) {
    errors.push(`${fieldName} must be one of: ${fieldDefinition.enum.join(', ')}.`);
  }

  return errors;
}

function validatePayload(definition, payload, { partial = false } = {}) {
  if (!isPlainObject(payload)) {
    return ['Request body must be a JSON object.'];
  }

  const errors = [];

  if (!partial) {
    definition.requiredOnCreate.forEach((fieldName) => {
      const value = payload[fieldName];
      if (value === undefined || value === null || value === '') {
        errors.push(`${fieldName} is required.`);
      }
    });
  }

  Object.entries(payload).forEach(([fieldName, value]) => {
    const fieldDefinition = definition.fields[fieldName];
    if (!fieldDefinition) {
      errors.push(`${fieldName} is not a supported field.`);
      return;
    }

    if (partial && value === undefined) {
      return;
    }

    errors.push(...validateField(fieldName, fieldDefinition, value));
  });

  return errors;
}

function validateCreate(definition, payload) {
  return validatePayload(definition, payload, { partial: false });
}

function validateUpdate(definition, payload) {
  return validatePayload(definition, payload, { partial: true });
}

module.exports = {
  validateCreate,
  validateUpdate,
};