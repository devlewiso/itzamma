"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Camera, Upload, Search } from "lucide-react";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [queryCount, setQueryCount] = useState(0);
  const [showDonationPrompt, setShowDonationPrompt] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleCapture = async () => {
    setCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing the camera:", err);
    }
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          setImage(new File([blob], "captured.png", { type: "image/png" }));
          setCapturing(false);
          if (videoRef.current?.srcObject instanceof MediaStream) {
            videoRef.current.srcObject
              .getTracks()
              .forEach((track) => track.stop());
          }
        }
      });
    }
  };

  const identifyPlant = async () => {
    if (!image) return;

    if (queryCount >= 5) {
      setShowDonationPrompt(true);
      return;
    }

    setLoading(true);
    setResult(null);

    const genAI = new GoogleGenerativeAI(
      "AIzaSyAyT74VJyYZWus5KxxX1VhwUxELJkxGIDo"
    );
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
      const imageBytes = await image.arrayBuffer();
      console.log(Buffer.from(imageBytes).toString("base64")); // Verifica si los datos de la imagen están correctos

      const result = await model.generateContent([
        "Identifica esta planta y proporciona información importante sobre ella en español.",
        {
          inlineData: {
            data: Buffer.from(imageBytes).toString("base64"),
            mimeType: image.type,
          },
        },
      ]);

      console.log(result); // Revisa la respuesta completa de la API

      if (result.response) {
        setResult(result.response.text());
        setQueryCount(queryCount + 1); // Incrementar el contador de consultas
      } else {
        setResult(
          "No se pudo obtener una respuesta del modelo. Por favor, intenta de nuevo."
        );
      }
    } catch (error) {
      console.error("Error al identificar la planta:", error);
      setResult(
        error instanceof Error
          ? `Error al identificar la planta: ${error.message}. Por favor, verifica tu conexión a internet y la clave API.`
          : "Error desconocido al identificar la planta. Por favor, intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-green-600 text-white p-4">
        <h1 className="text-2xl font-bold">Itzamná</h1>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Itzamná - Identificador de Plantas
          </h1>
          <p className="text-xl text-gray-600">
            Descubre el mundo vegetal con IA
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
          {capturing ? (
            <>
              <video ref={videoRef} className="w-full rounded-lg mb-4" />
              <button
                onClick={takePhoto}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors w-full mb-4"
              >
                Capturar Foto
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mb-4 w-full"
              >
                Elegir archivo
              </button>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                ref={fileInputRef}
              />
              <button
                onClick={handleCapture}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors mb-4 w-full"
              >
                Usar Cámara
              </button>
            </>
          )}
          {image && (
            <div className="mb-4">
              <Image
                src={URL.createObjectURL(image)}
                alt="Planta cargada"
                width={300}
                height={300}
                className="rounded-lg mx-auto"
              />
            </div>
          )}
          <button
            onClick={identifyPlant}
            disabled={!image || loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors w-full"
          >
            {loading ? "Identificando..." : "Identificar Planta"}
          </button>
          {result && (
            <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-green-700">
                Resultado:
              </h2>
              <p className="text-lg mb-4">{result}</p>
              <div className="mt-8 border-t pt-4">
                <p className="text-gray-500">
                  Creado por <strong>Iran Lewis</strong> con{" "}
                  <a
                    href="https://neuralcodelab.com"
                    target="_blank"
                    className="text-blue-500 hover:underline"
                  >
                    NeuralCodeLab.com
                  </a>
                  .
                </p>
              </div>
            </div>
          )}
        </div>

        <section className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Cómo funciona</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col items-center">
              <Camera className="mb-4 text-green-500" size={48} />
              <h3 className="text-xl font-semibold mb-2">1. Toma una foto</h3>
              <p>
                Captura una imagen clara de la planta que deseas identificar.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col items-center">
              <Upload className="mb-4 text-blue-500" size={48} />
              <h3 className="text-xl font-semibold mb-2">2. Sube la imagen</h3>
              <p>
                Carga la foto en nuestra aplicación usando el botón "Elegir
                archivo".
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col items-center">
              <Search className="mb-4 text-purple-500" size={48} />
              <h3 className="text-xl font-semibold mb-2">
                3. Obtén resultados
              </h3>
              <p>
                Nuestro sistema de IA analizará la imagen y te proporcionará
                información sobre la planta.
              </p>
            </div>
          </div>
        </section>
      </main>

      {showDonationPrompt && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm text-center">
            <h2 className="text-xl font-semibold mb-4">
              ¡Gracias por usar Itzamná!
            </h2>
            <p className="mb-4">
              Has realizado 5 consultas gratuitas. Considera apoyar nuestro
              proyecto con una donación para mantener el servicio funcionando.
            </p>
            <a
              href="https://paypal.me/exxxtasisM?country.x=GT&locale.x=es_XC"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
            >
              Donar con PayPal
            </a>
            <button
              onClick={() => setShowDonationPrompt(false)}
              className="mt-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Continuar sin donar
            </button>
          </div>
        </div>
      )}

      <footer className="bg-green-600 text-white p-4 text-center">
        <p>
          &copy; 2024 Itzamná - Identificador de Plantas. Todos los derechos
          reservados.
        </p>
        <div className="mt-2">
          <p>¿Te gusta nuestra aplicación? ¡Apóyanos con una donación!</p>
          <a
            href="https://paypal.me/exxxtasisM?country.x=GT&locale.x=es_XC"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-yellow-500 text-white px-4 py-2 mt-2 rounded hover:bg-yellow-600 transition-colors"
          >
            Donar con PayPal
          </a>
        </div>
      </footer>
    </div>
  );
}
