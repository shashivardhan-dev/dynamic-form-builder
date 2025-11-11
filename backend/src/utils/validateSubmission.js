import xss from 'xss';


export function sanitizeInput(value) {
  if (typeof value === 'string') return xss(value);
  if (Array.isArray(value)) return value.map(v => sanitizeInput(v));
  if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value)) out[k] = sanitizeInput(value[k]);
    return out;
  }
  return value;
}


function typeCheck(value, type) {
  if(value === undefined || value === null) return true;
  if(type === 'number') return !isNaN(Number(value));
  if(type === 'email') return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(String(value));
  if(type === 'date') return !isNaN(Date.parse(value));
  if(type === 'checkbox' || type === 'radio' || type === 'select') return Array.isArray(value) || typeof value === 'boolean' || typeof value === 'string';
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

function validateField(field, answers, errors) {
     if(field.type == "file"){
      return
    }
  const key = field.name;
  const val = answers[key];

  if(field.required) {
    if(val === undefined || val === null || val === '' || (Array.isArray(val) && val.length===0)) {
      errors[key] = errors[key] || [];
      errors[key].push('Field is required');
      return;
    }
  }

  if(val !== undefined && val !== null && field.type) {
    console.log(val, field.type)
    if(!typeCheck(val, field.type)) {
      errors[key] = errors[key] || [];
      errors[key].push('Invalid type for field');
      return;
    }

    const v = field.validation || {};
    if(field.type === 'number') {
      const num = Number(val);
      if(v.min !== undefined && num < v.min) errors[key] = errors[key] || [], errors[key].push(`Number below min ${v.min}`);
      if(v.max !== undefined && num > v.max) errors[key] = errors[key] || [], errors[key].push(`Number above max ${v.max}`);
    }

    if(v.regex) {
      try {
        const re = new RegExp(v.regex);
        if(!re.test(String(val))) errors[key] = errors[key] || [], errors[key].push('Value does not match pattern');
      } catch(e) {}
    }

    if((field.type === 'text' || field.type === 'textarea' || field.type === 'email') && (v.minLength || v.maxLength)) {
      const len = String(val).length;
      if(v.minLength !== undefined && len < v.minLength) errors[key] = errors[key] || [], errors[key].push('Too short');
      if(v.maxLength !== undefined && len > v.maxLength) errors[key] = errors[key] || [], errors[key].push('Too long');
    }

    if(['select','radio','checkbox'].includes(field.type) && field.options && field.options.length) {
   
       if (field.options?.length) {
          const values = Array.isArray(val) ? val : [val];

          console.log(values, "values")
          const invalid = values.find(val => !field.options.includes(val));
          if (invalid) errors[field.name] = 'Invalid option selected';
        }

      for(const opt of field.options) {
        if(String(opt.value) === String(val) && opt.conditionalFields && opt.conditionalFields.length) {
          for(const nf of opt.conditionalFields) {
            validateField(nf, answers, errors);
          }
        }
      }
    }
  }
}


export function validateSubmission(form, answers) {
  const errors = {};
  (form || []).forEach(f => validateField(f, answers, errors));
  console.log(errors)
 return { valid: Object.keys(errors).length === 0, errors }
}

