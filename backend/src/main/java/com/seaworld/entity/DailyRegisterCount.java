package com.seaworld.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "daily_register_count")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyRegisterCount {

    @Id
    @Column(name = "register_date")
    @Builder.Default
    private LocalDate registerDate = LocalDate.now();

    @Column(nullable = false)
    @Builder.Default
    private Integer count = 0;
}
