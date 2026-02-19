"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  onUpload: (contract: File, registry: File) => void;
}

function DropZone({
  label,
  file,
  onDrop,
}: {
  label: string;
  file: File | null;
  onDrop: (f: File) => void;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: (files) => files[0] && onDrop(files[0]),
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
        isDragActive
          ? "border-blue-500 bg-blue-50"
          : file
          ? "border-green-400 bg-green-50"
          : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
      }`}
    >
      <input {...getInputProps()} />
      {file ? (
        <div className="flex flex-col items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium text-green-700">{file.name}</p>
          <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="font-medium text-gray-700">{label}</p>
          <p className="text-sm text-gray-500">
            PDFをドラッグ&ドロップ、またはクリックして選択
          </p>
        </div>
      )}
    </div>
  );
}

export default function UploadStep({ onUpload }: Props) {
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [registryFile, setRegistryFile] = useState<File | null>(null);

  const canSubmit = contractFile && registryFile;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
        <h2 className="text-lg font-bold text-gray-900">PDFアップロード</h2>
        <p className="text-sm text-gray-600">
          契約書PDFと登記簿謄本PDFをアップロードしてください。AIが自動で情報を読み取ります。
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📄 契約書PDF
            </label>
            <DropZone
              label="契約書PDFを選択"
              file={contractFile}
              onDrop={setContractFile}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📋 登記簿謄本PDF
            </label>
            <DropZone
              label="登記簿謄本PDFを選択"
              file={registryFile}
              onDrop={setRegistryFile}
            />
          </div>
        </div>

        <button
          onClick={() => canSubmit && onUpload(contractFile!, registryFile!)}
          disabled={!canSubmit}
          className={`w-full py-3 rounded-xl font-bold text-white transition-colors ${
            canSubmit
              ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          🚀 AI解析を開始
        </button>
      </div>
    </div>
  );
}
