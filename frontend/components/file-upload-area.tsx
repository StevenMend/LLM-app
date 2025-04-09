// "use client"

// import type React from "react"
// import { useState, useRef } from "react"
// import { Button } from "./ui/button"
// import type { UploadedFile } from "@/lib/types"
// import { FileText, Upload, Loader2 } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"
// import { v4 as uuidv4 } from "uuid"

// interface FileUploadAreaProps {
//   onFileUpload: (files: File[]) => void // ✅ cambiado a File[]
//   uploadedFiles: UploadedFile[]
//   isLoading: boolean
// }

// // ✅ sigue usándose para mostrar lista en UI
// const toUploadedFiles = (files: File[]): UploadedFile[] => {
//   return files.map((file) => ({
//     id: uuidv4(),
//     name: file.name,
//     size: file.size,
//     type: file.type,
//   }))
// }

// export default function FileUploadArea({ onFileUpload, uploadedFiles, isLoading }: FileUploadAreaProps) {
//   const [isDragging, setIsDragging] = useState(false)
//   const fileInputRef = useRef<HTMLInputElement>(null)
//   const { toast } = useToast()

//   const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault()
//     setIsDragging(true)
//   }

//   const handleDragLeave = () => {
//     setIsDragging(false)
//   }

//   const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault()
//     setIsDragging(false)

//     const files = Array.from(e.dataTransfer.files).filter((file) => file.type === "application/pdf")

//     if (files.length === 0) {
//       toast({
//         title: "Formato no válido",
//         description: "Solo se permiten archivos PDF.",
//         variant: "destructive",
//       })
//       return
//     }

//     onFileUpload(files) // ✅ pasar archivos reales
//   }

//   const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const files = Array.from(e.target.files).filter((file) => file.type === "application/pdf")

//       if (files.length === 0) {
//         toast({
//           title: "Formato no válido",
//           description: "Solo se permiten archivos PDF.",
//           variant: "destructive",
//         })
//         return
//       }

//       onFileUpload(files) // ✅ pasar archivos reales
//     }
//   }

//   const formatFileSize = (bytes: number): string => {
//     if (bytes < 1024) return bytes + " bytes"
//     else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
//     else return (bytes / 1048576).toFixed(1) + " MB"
//   }

//   return (
//     <div className="space-y-6">
//       <div
//         className={`border-2 border-dashed rounded-lg p-4 text-center ${
//           isDragging ? "border-blue-500 bg-blue-500/10" : "border-gray-700"
//         } transition-colors duration-200`}
//         onDragOver={handleDragOver}
//         onDragLeave={handleDragLeave}
//         onDrop={handleDrop}
//       >
//         <div className="flex flex-col items-center justify-center space-y-3">
//           <Upload className="h-8 w-8 text-gray-400" />
//           <div className="space-y-1">
//             <h3 className="text-sm font-medium">Arrastra PDFs aquí</h3>
//             <p className="text-xs text-gray-400">o selecciona archivos</p>
//           </div>
//           <Button
//             onClick={() => fileInputRef.current?.click()}
//             disabled={isLoading}
//             className="bg-blue-600 hover:bg-blue-700 text-xs py-1 h-8"
//             size="sm"
//           >
//             {isLoading ? (
//               <>
//                 <Loader2 className="mr-2 h-3 w-3 animate-spin" />
//                 Procesando...
//               </>
//             ) : (
//               "Seleccionar archivos"
//             )}
//           </Button>
//           <input
//             type="file"
//             ref={fileInputRef}
//             onChange={handleFileInputChange}
//             accept=".pdf"
//             multiple
//             className="hidden"
//             aria-label="Subir archivos PDF"
//           />
//         </div>
//       </div>

//       {uploadedFiles.length > 0 && (
//         <div className="space-y-3">
//           <h3 className="text-sm font-medium">Archivos cargados</h3>
//           <div className="space-y-2">
//             {uploadedFiles.map((file) => (
//               <div
//                 key={file.id} 
//                 className="flex items-center justify-between p-2 bg-[#1A1D2A] rounded-lg border border-gray-800"
//               >
//                 <div className="flex items-center space-x-2 overflow-hidden">
//                   <FileText className="h-5 w-5 flex-shrink-0 text-blue-400" />
//                   <div className="overflow-hidden">
//                     <p className="font-medium text-xs truncate">{file.name}</p>
//                     <p className="text-xs text-gray-400">{formatFileSize(file.size || 0)}</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "./ui/button"
import type { UploadedFile } from "@/lib/types"
import { FileText, Upload, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from "uuid"

interface FileUploadAreaProps {
  onFileUpload: (files: File[]) => void // ✅ cambiado a File[]
  uploadedFiles: UploadedFile[]
  isLoading: boolean
}

// ✅ sigue usándose para mostrar lista en UI
const toUploadedFiles = (files: File[]): UploadedFile[] => {
  return files.map((file) => ({
    id: uuidv4(),
    name: file.name,
    size: file.size,
    type: file.type,
  }))
}

export default function FileUploadArea({ onFileUpload, uploadedFiles, isLoading }: FileUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).filter((file) => file.type === "application/pdf")

    if (files.length === 0) {
      toast({
        title: "Formato no válido",
        description: "Solo se permiten archivos PDF.",
        variant: "destructive",
      })
      return
    }

    onFileUpload(files) // ✅ pasar archivos reales
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter((file) => file.type === "application/pdf")

      if (files.length === 0) {
        toast({
          title: "Formato no válido",
          description: "Solo se permiten archivos PDF.",
          variant: "destructive",
        })
        return
      }

      onFileUpload(files) // ✅ pasar archivos reales
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  return (
    <div className="space-y-6">
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center ${
          isDragging ? "border-blue-500 bg-blue-500/10" : "border-gray-700"
        } transition-colors duration-200`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <Upload className="h-8 w-8 text-gray-400" />
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Arrastra PDFs aquí</h3>
            <p className="text-xs text-gray-400">o selecciona archivos</p>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-xs py-1 h-8"
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Procesando...
              </>
            ) : (
              "Seleccionar archivos"
            )}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".pdf"
            multiple
            className="hidden"
            aria-label="Subir archivos PDF"
          />
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Archivos cargados</h3>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id} // ✅ ← ESTA ES LA CLAVE ÚNICA QUE FALTABA
                className="flex items-center justify-between p-2 bg-[#1A1D2A] rounded-lg border border-gray-800"
              >
                <div className="flex items-center space-x-2 overflow-hidden">
                  <FileText className="h-5 w-5 flex-shrink-0 text-blue-400" />
                  <div className="overflow-hidden">
                    <p className="font-medium text-xs truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(file.size || 0)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
