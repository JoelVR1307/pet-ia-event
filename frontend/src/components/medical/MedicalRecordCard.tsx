import React, { useState } from 'react';
import { type MedicalRecord, MedicalRecordType } from '../../types/medical.types';
import { medicalService } from '../../services/medical.service';

interface MedicalRecordCardProps {
  record: MedicalRecord;
  onUpdate?: (record: MedicalRecord) => void;
  onDelete?: (recordId: number) => void;
  showActions?: boolean;
}

const MedicalRecordCard: React.FC<MedicalRecordCardProps> = ({
  record,
  onUpdate,
  onDelete,
  showActions = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getTypeColor = (type: MedicalRecordType) => {
    switch (type) {
      case MedicalRecordType.CHECKUP:
        return 'bg-blue-100 text-blue-800';
      case MedicalRecordType.VACCINATION:
        return 'bg-green-100 text-green-800';
      case MedicalRecordType.SURGERY:
        return 'bg-red-100 text-red-800';
      case MedicalRecordType.ILLNESS:
        return 'bg-orange-100 text-orange-800';
      case MedicalRecordType.INJURY:
        return 'bg-yellow-100 text-yellow-800';
      case MedicalRecordType.MEDICATION:
        return 'bg-purple-100 text-purple-800';
      case MedicalRecordType.TEST_RESULT:
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: MedicalRecordType) => {
    switch (type) {
      case MedicalRecordType.CHECKUP:
        return '🩺';
      case MedicalRecordType.VACCINATION:
        return '💉';
      case MedicalRecordType.SURGERY:
        return '🏥';
      case MedicalRecordType.ILLNESS:
        return '🤒';
      case MedicalRecordType.INJURY:
        return '🩹';
      case MedicalRecordType.MEDICATION:
        return '💊';
      case MedicalRecordType.TEST_RESULT:
        return '🧪';
      default:
        return '📋';
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !window.confirm('¿Estás seguro de que quieres eliminar este registro médico?')) return;

    setIsLoading(true);
    try {
      await medicalService.deleteMedicalRecord(record.id);
      onDelete(record.id);
    } catch (error) {
      console.error('Error deleting medical record:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const downloadAttachment = (url: string, filename?: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'attachment';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getTypeIcon(record.type)}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {record.title}
              </h3>
              <p className="text-sm text-gray-600">
                {formatDate(record.date)}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(record.type)}`}>
            {record.type.replace('_', ' ')}
          </span>
        </div>

        {/* Pet Info */}
        <div className="flex items-center space-x-3 mt-3">
          {record.pet.photoUrl && (
            <img
              src={record.pet.photoUrl}
              alt={record.pet.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">{record.pet.name}</p>
            <p className="text-xs text-gray-600">
              {record.pet.species} - {record.pet.breed}
            </p>
          </div>
        </div>

        {/* Veterinarian Info */}
        {record.veterinarian && (
          <div className="mt-2">
            <p className="text-xs text-gray-600">
              Veterinario: <span className="font-medium">{record.veterinarian.user.name}</span>
            </p>
            <p className="text-xs text-gray-600">{record.veterinarian.clinicName}</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Description */}
        <div className="mb-3">
          <p className="text-sm text-gray-800">{record.description}</p>
        </div>

        {/* Expandable Content */}
        {(record.diagnosis || record.treatment || record.medications) && (
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium mb-2"
            >
              {isExpanded ? 'Ver menos' : 'Ver detalles'} ▼
            </button>

            {isExpanded && (
              <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
                {/* Diagnosis */}
                {record.diagnosis && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Diagnóstico:</h4>
                    <p className="text-sm text-gray-700">{record.diagnosis}</p>
                  </div>
                )}

                {/* Treatment */}
                {record.treatment && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Tratamiento:</h4>
                    <p className="text-sm text-gray-700">{record.treatment}</p>
                  </div>
                )}

                {/* Medications */}
                {record.medications && record.medications.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Medicamentos:</h4>
                    <div className="space-y-2">
                      {record.medications.map((medication, index) => (
                        <div key={index} className="bg-white p-2 rounded border">
                          <p className="text-sm font-medium text-gray-900">{medication.name}</p>
                          <p className="text-xs text-gray-600">
                            Dosis: {medication.dosage} | Frecuencia: {medication.frequency}
                          </p>
                          <p className="text-xs text-gray-600">
                            Duración: {medication.duration}
                          </p>
                          {medication.instructions && (
                            <p className="text-xs text-gray-600 mt-1">
                              Instrucciones: {medication.instructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Attachments */}
        {record.attachments && record.attachments.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Archivos adjuntos:</h4>
            <div className="flex flex-wrap gap-2">
              {record.attachments.map((attachment, index) => (
                <button
                  key={index}
                  onClick={() => downloadAttachment(attachment, `attachment-${index + 1}`)}
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                >
                  📎 Archivo {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-200">
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordCard;