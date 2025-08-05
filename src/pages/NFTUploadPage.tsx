import React, { useState } from 'react';
import { FaUpload, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaFile } from 'react-icons/fa';
import axios from 'axios';

export const NFTUploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [jsonData, setJsonData] = useState<any>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
      setResults(null);
      setJsonData(null);
      
      // Read and parse the file to show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          setJsonData(data);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
      reader.readAsText(file);
    } else {
      alert('Por favor selecciona un archivo JSON válido');
    }
  };

  const uploadNFTs = async () => {
    if (!selectedFile || !jsonData) {
      alert('Por favor selecciona un archivo JSON válido');
      return;
    }

    setUploading(true);
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    const token = localStorage.getItem('auth-token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    // Get NFT data array
    const nftsData = jsonData.data || [];

    for (const nftData of nftsData) {
      try {
        const response = await axios.post(
          'http://localhost:1337/api/nft-marketplaces',
          { data: nftData },
          { headers }
        );

        if (response.data) {
          results.success++;
          console.log(`✅ NFT subido: ${nftData.metadata?.name}`);
        }
      } catch (error: any) {
        results.failed++;
        const errorMsg = `${nftData.metadata?.name}: ${error.response?.data?.error?.message || error.message}`;
        results.errors.push(errorMsg);
        console.error(`❌ Error subiendo NFT ${nftData.metadata?.name}:`, error);
      }
    }

    setResults(results);
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Subir NFTs a Strapi v4 Marketplace
        </h1>

        {/* File Upload Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Seleccionar Archivo JSON</h2>
          
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
            <FaFile className="text-4xl text-gray-400 mx-auto mb-4" />
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
              id="jsonFile"
            />
            <label
              htmlFor="jsonFile"
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <FaUpload />
              Seleccionar marketplace-nft-data.json
            </label>
            
            {selectedFile && (
              <div className="mt-4 text-green-400">
                ✅ Archivo seleccionado: {selectedFile.name}
              </div>
            )}
          </div>
        </div>

        {/* JSON Preview */}
        {jsonData && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Vista Previa - {jsonData.data?.length || 0} NFTs encontrados
            </h2>
            <div className="bg-gray-900 rounded p-4 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jsonData.data?.slice(0, 6).map((nft: any, index: number) => (
                  <div key={index} className="bg-gray-700 rounded p-3">
                    <div className="font-semibold text-sm">{nft.metadata?.name}</div>
                    <div className="text-xs text-gray-400">{nft.metadata?.rarity}</div>
                    <div className="text-xs text-green-400">{nft.listing_price_eth} ETH</div>
                  </div>
                ))}
              </div>
              {jsonData.data?.length > 6 && (
                <div className="text-center text-gray-400 mt-4">
                  ... y {jsonData.data.length - 6} NFTs más
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload Button */}
        {selectedFile && (
          <div className="text-center mb-6">
            <button
              onClick={uploadNFTs}
              disabled={uploading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-8 py-3 rounded-lg inline-flex items-center gap-2 text-lg font-semibold transition-colors"
            >
              {uploading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Subiendo NFTs...
                </>
              ) : (
                <>
                  <FaUpload />
                  Subir {jsonData?.data?.length || 0} NFTs a Strapi
                </>
              )}
            </button>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Resultados de la Subida</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-green-900/30 border border-green-600 rounded-lg p-4 text-center">
                <FaCheckCircle className="text-green-400 text-2xl mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-400">{results.success}</div>
                <div className="text-green-300">NFTs Subidos Exitosamente</div>
              </div>
              
              <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 text-center">
                <FaExclamationTriangle className="text-red-400 text-2xl mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-400">{results.failed}</div>
                <div className="text-red-300">NFTs con Errores</div>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
                <h3 className="font-semibold text-red-400 mb-2">Errores:</h3>
                <div className="max-h-40 overflow-y-auto">
                  {results.errors.map((error, index) => (
                    <div key={index} className="text-red-300 text-sm mb-1">
                      • {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.success > 0 && (
              <div className="mt-4 text-center">
                <a
                  href="http://localhost:1337/admin/content-manager/collection-types/api::nft-marketplace.nft-marketplace"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Ver NFTs subidos en Strapi Admin
                </a>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Instrucciones</h2>
          <div className="text-gray-300 space-y-2">
            <p>1. Selecciona el archivo <code className="bg-gray-700 px-2 py-1 rounded">marketplace-nft-data.json</code></p>
            <p>2. Revisa la vista previa de los NFTs</p>
            <p>3. Haz clic en "Subir NFTs a Strapi" para comenzar</p>
            <p>4. Los NFTs se subirán a la colección <code className="bg-gray-700 px-2 py-1 rounded">nft-marketplaces</code></p>
            <p>5. Puedes verificar los resultados en el admin de Strapi</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 