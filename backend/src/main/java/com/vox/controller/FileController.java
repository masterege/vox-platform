package com.vox.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "http://localhost:5173")
public class FileController {

    // We will store files in a folder named "uploads" in the project root
    private final Path rootLocation = Paths.get("uploads");

    public FileController() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage", e);
        }
    }

    @PostMapping("/upload")
    public FileResponse uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        // Generate a unique filename to prevent overwrites (uuid.jpg)
        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

        Files.copy(file.getInputStream(), this.rootLocation.resolve(filename));

        // Return the URL that the frontend can use to display it
        String fileUrl = "http://localhost:8080/api/files/view/" + filename;
        return new FileResponse(fileUrl);
    }

    // Serve the file when the browser requests the URL
    @GetMapping("/view/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) throws MalformedURLException {
        Path file = rootLocation.resolve(filename);
        Resource resource = new UrlResource(file.toUri());

        if (resource.exists() || resource.isReadable()) {
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG) // Basic type for now
                    .body(resource);
        } else {
            throw new RuntimeException("Could not read file: " + filename);
        }
    }

    public record FileResponse(String url) {
    }
}