export default function FileUpload({ files, onFilesChange }) {
  return (
    <div className="grid gap-2">
      <label htmlFor="documents" className="font-extrabold text-[#183946]">
        Documents
      </label>
      <input
        id="documents"
        type="file"
        accept=".pdf,image/png,image/jpeg,image/webp"
        multiple
        onChange={(event) => onFilesChange(event.target.files)}
        className="w-full rounded-md border border-[#bdd4d2] bg-[#fbfefd] p-3 text-[#16323f]"
      />
      <p className="m-0 text-sm text-[#60747a]">PDF and image parsing are structured for later; text input works in this foundation.</p>
      {files.length > 0 ? (
        <ul className="m-0 grid list-none gap-2 p-0" aria-label="Selected files">
          {files.map((file) => (
            <li
              key={`${file.name}-${file.size}`}
              className="flex flex-wrap justify-between gap-2 rounded-md border border-[#d7e5e3] px-3 py-2"
            >
              <span className="min-w-0 break-words">{file.name}</span>
              <small className="shrink-0 text-[#60747a]">{Math.ceil(file.size / 1024)} KB</small>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
