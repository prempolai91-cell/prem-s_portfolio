
'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
  WithFieldValue,
  DocumentData,
  UpdateData,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally but handles permission errors.
 * Returns a promise that can be awaited by the caller.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: WithFieldValue<DocumentData>, options?: SetOptions): Promise<void> {
  const promise = options ? setDoc(docRef, data, options) : setDoc(docRef, data);
  promise.catch(error => {
    if (error.code === 'permission-denied') {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: options?.merge ? 'update' : 'create',
          requestResourceData: data,
        })
      );
    } else {
      console.error("setDoc failed with a non-permission error:", error);
    }
    // We still re-throw the error so the caller can handle non-permission errors if they choose to.
    // This allows UI to react to any failure, not just permission-denied.
    throw error;
  });
  return promise;
}

/**
 * Initiates an addDoc operation for a collection reference.
 * Does NOT await the write operation internally but handles permission errors.
 * Returns a promise that can be awaited by the caller.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: WithFieldValue<DocumentData>): Promise<DocumentReference> {
  const promise = addDoc(colRef, data);
  promise.catch(error => {
    if (error.code === 'permission-denied') {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: data,
        })
      );
    } else {
        console.error("addDoc failed with a non-permission error:", error);
    }
    throw error;
  });
  return promise;
}

/**
 * Initiates an updateDoc operation for a document reference.
 * Does NOT await the write operation internally but handles permission errors.
 * Returns a promise that can be awaited by the caller.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: UpdateData<DocumentData>): Promise<void> {
  const promise = updateDoc(docRef, data);
  promise.catch(error => {
    if (error.code === 'permission-denied') {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        })
      );
    } else {
        console.error("updateDoc failed with a non-permission error:", error);
    }
    throw error;
  });
  return promise;
}

/**
 * Initiates a deleteDoc operation for a document reference.
 * Does NOT await the write operation internally but handles permission errors.
 * Returns a promise that can be awaited by the caller.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference): Promise<void> {
  const promise = deleteDoc(docRef);
  promise.catch(error => {
    if (error.code === 'permission-denied') {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      );
    } else {
        console.error("deleteDoc failed with a non-permission error:", error);
    }
    throw error;
  });
  return promise;
}
