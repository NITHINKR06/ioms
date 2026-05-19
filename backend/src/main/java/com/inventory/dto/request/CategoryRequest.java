package com.inventory.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
@Getter @Setter
public class CategoryRequest {
    @NotBlank private String name;
    private String description;
}
