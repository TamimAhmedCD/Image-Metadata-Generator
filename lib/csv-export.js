export function exportSingleCSV(img, exportFormat) {
  if (!img.result) return;
  const result = img.result;
  const sanitize = (text) => (text || "").replace(/"/g, '""');

  let csv = "";

  if (exportFormat === "full") {
    const header = "Filename,Title,Description,Keywords\n";
    const dataRow = `"${sanitize(img.file.name)}","${sanitize(
      result.title
    )}","${sanitize(result.prompt)}","${sanitize(result.keywords)}"`;
    csv = header + dataRow;
  } else {
    const header = "Filename,Title,Keywords\n";
    const dataRow = `"${sanitize(img.file.name)}","${sanitize(
      result.title
    )}","${sanitize(result.keywords)}"`;
    csv = header + dataRow;
  }

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute(
    "download",
    `${exportFormat}_metadata_${result.title.replace(/\s/g, "_")}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportBulkCSV(images, exportFormat) {
  const completedImages = images.filter(
    (img) => img.status === "complete" && img.result
  );
  if (completedImages.length === 0) return;

  const sanitize = (text) => (text || "").replace(/"/g, '""');

  let csv = "";

  if (exportFormat === "full") {
    csv = "Filename,Title,Description,Keywords\n";
    completedImages.forEach((img) => {
      const result = img.result;
      csv += `"${sanitize(img.file.name)}","${sanitize(
        result.title
      )}","${sanitize(result.prompt)}","${sanitize(result.keywords)}"\n`;
    });
  } else {
    csv = "Filename,Title,Keywords\n";
    completedImages.forEach((img) => {
      const result = img.result;
      csv += `"${sanitize(img.file.name)}","${sanitize(
        result.title
      )}","${sanitize(result.keywords)}"\n`;
    });
  }

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute(
    "download",
    `bulk_${exportFormat}_metadata_${
      new Date().toISOString().split("T")[0]
    }.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
