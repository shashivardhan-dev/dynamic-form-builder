import { validateSubmission } from '../src/utils/validateSubmission.js'

test('required + number validation', () => {
  const fields = [
    { name: 'age', label: 'Age', type: 'number', required: true, validation: { min: 18, max: 60 } }
  ];
  const { valid, errors } = validateSubmission(fields, { age: 17 });
  expect(valid).toBe(false);
  expect(errors.age).toStrictEqual(['Number below min 18']);
});
