import { Parser } from 'json2csv';

export function submissionsToCSV(submissions) {
  const rows = submissions.map(s => ({
    submittedAt: s.submittedAt,
    formGroupId: s.formGroupId,
    formVersion: s.formVersion,
    ...Object.fromEntries(Object.entries(s.data || {}).map(([k, v]) => [k, Array.isArray(v) ? v.join(';') : v]))
  }));
  const parser = new Parser();
  return parser.parse(rows);
}
