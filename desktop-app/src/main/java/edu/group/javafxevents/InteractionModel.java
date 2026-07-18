package edu.group.javafxevents;

import java.util.Locale;

public final class InteractionModel {
  public static final String DEFAULT_GREETING = "Enter your name to begin.";
  public static final String DEFAULT_STATUS = "Click anywhere in the playground.";
  private static final int MAX_NAME_LENGTH = 40;

  private int clickCount;
  private double lastClickX;
  private double lastClickY;

  public String createGreeting(String rawName) {
    String name = rawName == null ? "" : rawName.trim();
    if (name.isEmpty()) {
      return "Please enter your name.";
    }
    if (name.length() > MAX_NAME_LENGTH) {
      return "Please use a name with 40 characters or fewer.";
    }
    return "Hello, " + name + "!";
  }

  public String recordCanvasClick(double x, double y) {
    validateCoordinate(x, "x");
    validateCoordinate(y, "y");
    clickCount++;
    lastClickX = x;
    lastClickY = y;
    return String.format(
        Locale.ROOT, "Canvas click #%d at (%.0f, %.0f)", clickCount, lastClickX, lastClickY);
  }

  public void reset() {
    clickCount = 0;
    lastClickX = 0;
    lastClickY = 0;
  }

  public int getClickCount() {
    return clickCount;
  }

  public double getLastClickX() {
    return lastClickX;
  }

  public double getLastClickY() {
    return lastClickY;
  }

  private void validateCoordinate(double coordinate, String axis) {
    if (!Double.isFinite(coordinate) || coordinate < 0) {
      throw new IllegalArgumentException(axis + " coordinate must be finite and non-negative.");
    }
  }
}
