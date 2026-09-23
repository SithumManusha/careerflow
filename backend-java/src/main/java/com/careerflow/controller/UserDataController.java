package com.careerflow.controller;

import com.careerflow.dto.UserCVDraftDTO;
import com.careerflow.dto.UserScanDTO;
import com.careerflow.entity.UserAccount;
import com.careerflow.service.AuthService;
import com.careerflow.service.UserDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@Tag(name = "User Dashboard Data", description = "User ATS scan history and saved CV drafts")
public class UserDataController {

    private final AuthService authService;
    private final UserDataService userDataService;

    public UserDataController(AuthService authService, UserDataService userDataService) {
        this.authService = authService;
        this.userDataService = userDataService;
    }

    @GetMapping("/scans")
    @Operation(summary = "Get user's past ATS scan history")
    public ResponseEntity<?> getScans(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserAccount user = authService.validateTokenAndGetUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        List<UserScanDTO> scans = userDataService.getUserScans(user.getId());
        return ResponseEntity.ok(scans);
    }

    @PostMapping("/scans")
    @Operation(summary = "Save ATS scan result to user's history")
    public ResponseEntity<?> saveScan(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                      @RequestBody UserScanDTO scanDTO) {
        UserAccount user = authService.validateTokenAndGetUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        UserScanDTO saved = userDataService.saveScan(user.getId(), scanDTO);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/scans/{id}")
    @Operation(summary = "Delete scan record from history")
    public ResponseEntity<?> deleteScan(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                        @PathVariable Long id) {
        UserAccount user = authService.validateTokenAndGetUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        userDataService.deleteScan(user.getId(), id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/drafts")
    @Operation(summary = "Get user's saved CV drafts")
    public ResponseEntity<?> getDrafts(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserAccount user = authService.validateTokenAndGetUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        List<UserCVDraftDTO> drafts = userDataService.getUserDrafts(user.getId());
        return ResponseEntity.ok(drafts);
    }

    @PostMapping("/drafts")
    @Operation(summary = "Save or update CV draft in cloud")
    public ResponseEntity<?> saveDraft(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                       @RequestBody UserCVDraftDTO draftDTO) {
        UserAccount user = authService.validateTokenAndGetUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        UserCVDraftDTO saved = userDataService.saveOrUpdateDraft(user.getId(), draftDTO);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/drafts/{id}")
    @Operation(summary = "Delete saved CV draft")
    public ResponseEntity<?> deleteDraft(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                         @PathVariable Long id) {
        UserAccount user = authService.validateTokenAndGetUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        userDataService.deleteDraft(user.getId(), id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
