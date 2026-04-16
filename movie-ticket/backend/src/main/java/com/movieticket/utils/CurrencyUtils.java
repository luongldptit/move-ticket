package com.movieticket.utils;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

public class CurrencyUtils {

    private static final Locale VIETNAM = new Locale("vi", "VN");

    private CurrencyUtils() {}

    public static String formatVND(BigDecimal amount) {
        if (amount == null) return "0 ₫";
        NumberFormat currencyFormatter = NumberFormat.getCurrencyInstance(VIETNAM);
        return currencyFormatter.format(amount);
    }
}
