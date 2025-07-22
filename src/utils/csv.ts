// Utility to convert an array of objects to CSV string
export function convertToCSV(objArray: any[]): string {
  if (!objArray || objArray.length === 0) return "";
  const headers = Object.keys(objArray[0]);
  const csvRows = [headers.join(",")];
  for (const obj of objArray) {
    const row = headers.map((header) => {
      let value = obj[header] === undefined ? "" : obj[header];
      if (typeof value === "string") {
        value = value.replace(/"/g, '""');
        if (
          value.includes(",") ||
          value.includes("\n") ||
          value.includes('"')
        ) {
          value = `"${value}"`;
        }
      }
      return value;
    });
    csvRows.push(row.join(","));
  }
  return csvRows.join("\r\n");
}
