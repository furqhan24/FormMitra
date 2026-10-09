export default function FileUpload({ files, onFilesChange }) {
  return (
    <div className="field-group">
      <label htmlFor="documents">Documents</label>
      <input
        id="documents"
        type="file"
        accept=".pdf,image/png,image/jpeg,image/webp"
        multiple
        onChange={(event) => onFilesChange(event.target.files)}
      />
      <p className="hint">PDF and image parsing are structured for later; text input works in this foundation.</p>
      {files.length > 0 ? (
        <ul className="file-list" aria-label="Selected files">
          {files.map((file) => (
            <li key={`${file.name}-${file.size}`}>
              <span>{file.name}</span>
              <small>{Math.ceil(file.size / 1024)} KB</small>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
