package com.graphhopper.shaded.utils;

import com.graphhopper.shaded.JobMetadata;

public class RequestContext {

  private static final ThreadLocal<JobMetadata> metadataHolder = new ThreadLocal<>();

  public static void setMetadata(JobMetadata metadata) {
    metadataHolder.set(metadata);
  }

  public static JobMetadata getMetadata() {
    return metadataHolder.get();
  }

  public static void clearMetadata() {
    metadataHolder.remove();
  }

}
