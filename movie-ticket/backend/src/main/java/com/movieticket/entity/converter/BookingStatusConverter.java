package com.movieticket.entity.converter;

import com.movieticket.entity.Booking;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.stream.Stream;

@Converter(autoApply = true)
public class BookingStatusConverter implements AttributeConverter<Booking.BookingStatus, String> {

    @Override
    public String convertToDatabaseColumn(Booking.BookingStatus status) {
        if (status == null) {
            return null;
        }
        return status.name();
    }

    @Override
    public Booking.BookingStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return Stream.of(Booking.BookingStatus.values())
                .filter(s -> s.name().equals(dbData))
                .findFirst()
                .orElseThrow(IllegalArgumentException::new);
    }
}
