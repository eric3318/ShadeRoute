package com.graphhopper.shaded.utils;

public class RequestContext {

  private static final ThreadLocal<String> requestIdHolder = new ThreadLocal<>();

  public static void setRequestId(String requestId) {
    requestIdHolder.set(requestId);
  }

  public static String getRequestId() {
    return requestIdHolder.get();
  }

  public static void clearRequestId() {
    requestIdHolder.remove();
  }

}
