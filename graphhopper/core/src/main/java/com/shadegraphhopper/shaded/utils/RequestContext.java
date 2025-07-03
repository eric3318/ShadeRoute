package com.shadegraphhopper.shaded.utils;

import com.shadegraphhopper.shaded.JobMetadata;

/**
 * Utility class for storing and accessing per-thread {@link JobMetadata} context.
 */
public class RequestContext {

  private static final ThreadLocal<JobMetadata> metadataHolder = new ThreadLocal<>();

  /**
   * Sets the {@link JobMetadata} for the current thread.
   */
  public static void setMetadata(JobMetadata metadata) {
    metadataHolder.set(metadata);
  }

  /**
   * Retrieves the {@link JobMetadata} associated with the current thread.
   */
  public static JobMetadata getMetadata() {
    return metadataHolder.get();
  }

  /**
   * Clears the {@link JobMetadata} associated with the current thread.
   * This should be called to prevent memory leaks when thread reuse occurs in thread pools.
   */
  public static void clearMetadata() {
    metadataHolder.remove();
  }
}
