<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Profile - SoulBridge</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="/assets/css/navigation.css" />
    <link rel="stylesheet" href="/assets/css/edit-profile.css" />
    <script src="/assets/js/edit-profile.js" defer></script>
</head>
<body>
    <?php include 'view/nav.view.php'; ?>
    
    <main class="main-container">
        <div class="container">
            <div class="edit-profile-card">
                <header class="card-header">
                    <div class="header-content">
                        <button class="back-btn" onclick="window.history.back()">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <div class="header-text">
                            <h1>Edit Profile</h1>
                            <p>Update your personal information</p>
                        </div>
                    </div>
                </header>

                <div class="card-content">
                    <!-- Profile Picture Section -->
                    <section class="profile-picture-section">
                        <div class="current-picture">
                            <div class="picture-container">
                                <img id="currentAvatar" 
                                     src="<?= htmlspecialchars($user['avatar'] ?? 'images/profile.jpg') ?>" 
                                     alt="Current Profile Picture"
                                     onerror="this.src='images/profile.jpg'">
                                <div class="picture-overlay">
                                    <button type="button" class="change-picture-btn" onclick="document.getElementById('avatarInput').click()">
                                        <i class="fas fa-camera"></i>
                                        <span>Change Photo</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Hidden file input -->
                        <input type="file" 
                               id="avatarInput" 
                               accept="image/*" 
                               style="display: none;"
                               onchange="previewAvatar(event)">
                        
                        <!-- Preview section -->
                        <div id="avatarPreview" class="avatar-preview" style="display: none;">
                            <div class="preview-container">
                                <img id="previewImage" src="" alt="Preview">
                                <div class="preview-actions">
                                    <button type="button" class="btn btn-secondary" onclick="cancelAvatarPreview()">
                                        <i class="fas fa-times"></i>
                                        Cancel
                                    </button>
                                    <button type="button" class="btn btn-primary" onclick="uploadAvatar()">
                                        <i class="fas fa-check"></i>
                                        Save Photo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Profile Form -->
                    <form id="profileForm" class="profile-form" onsubmit="updateProfile(event)">
                        <div class="form-section">
                            <h3 class="section-title">
                                <i class="fas fa-user"></i>
                                Personal Information
                            </h3>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="firstName">First Name</label>
                                    <input type="text" 
                                           id="firstName" 
                                           name="firstName" 
                                           value="<?= htmlspecialchars($user['firstName'] ?? '') ?>"
                                           required
                                           maxlength="50">
                                    <div class="form-error" id="firstName-error"></div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="lastName">Last Name</label>
                                    <input type="text" 
                                           id="lastName" 
                                           name="lastName" 
                                           value="<?= htmlspecialchars($user['lastName'] ?? '') ?>"
                                           required
                                           maxlength="50">
                                    <div class="form-error" id="lastName-error"></div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="email">Email Address</label>
                                <input type="email" 
                                       id="email" 
                                       name="email" 
                                       value="<?= htmlspecialchars($user['email'] ?? '') ?>"
                                       required
                                       maxlength="255">
                                <div class="form-error" id="email-error"></div>
                            </div>

                            <div class="form-group">
                                <label for="birthdate">Date of Birth</label>
                                <input type="date" 
                                       id="birthdate" 
                                       name="birthdate" 
                                       value="<?= htmlspecialchars($user['birthdate'] ?? '') ?>">
                                <div class="form-error" id="birthdate-error"></div>
                            </div>

                            <div class="form-group">
                                <label for="gender">Gender</label>
                                <select id="gender" name="gender">
                                    <option value="">Select Gender</option>
                                    <option value="M" <?= ($user['gender'] ?? '') === 'M' ? 'selected' : '' ?>>Male</option>
                                    <option value="F" <?= ($user['gender'] ?? '') === 'F' ? 'selected' : '' ?>>Female</option>
                                    <option value="Other" <?= ($user['gender'] ?? '') === 'Other' ? 'selected' : '' ?>>Other</option>
                                </select>
                                <div class="form-error" id="gender-error"></div>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3 class="section-title">
                                <i class="fas fa-info-circle"></i>
                                About You
                            </h3>
                            
                            <div class="form-group">
                                <label for="bio">Bio</label>
                                <textarea id="bio" 
                                          name="bio" 
                                          rows="4" 
                                          maxlength="500"
                                          placeholder="Tell people about yourself..."><?= htmlspecialchars($user['bio'] ?? '') ?></textarea>
                                <div class="char-count">
                                    <span id="bioCharCount">0</span>/500 characters
                                </div>
                                <div class="form-error" id="bio-error"></div>
                            </div>

                            <div class="form-group">
                                <label for="location">Location</label>
                                <input type="text" 
                                       id="location" 
                                       name="location" 
                                       value="<?= htmlspecialchars($user['location'] ?? '') ?>"
                                       maxlength="100"
                                       placeholder="City, Country">
                                <div class="form-error" id="location-error"></div>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3 class="section-title">
                                <i class="fas fa-lock"></i>
                                Security
                            </h3>
                            
                            <div class="form-group">
                                <label for="currentPassword">Current Password</label>
                                <div class="password-input">
                                    <input type="password" 
                                           id="currentPassword" 
                                           name="currentPassword" 
                                           placeholder="Enter current password to save changes"
                                           required>
                                    <button type="button" class="password-toggle" onclick="togglePassword('currentPassword')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                <div class="form-error" id="currentPassword-error"></div>
                            </div>

                            <div class="password-change-section">
                                <button type="button" class="btn btn-secondary" onclick="togglePasswordChange()">
                                    <i class="fas fa-key"></i>
                                    Change Password
                                </button>
                                
                                <div id="passwordChangeFields" class="password-fields" style="display: none;">
                                    <div class="form-group">
                                        <label for="newPassword">New Password</label>
                                        <div class="password-input">
                                            <input type="password" 
                                                   id="newPassword" 
                                                   name="newPassword" 
                                                   minlength="8"
                                                   placeholder="Enter new password">
                                            <button type="button" class="password-toggle" onclick="togglePassword('newPassword')">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </div>
                                        <div class="password-strength" id="passwordStrength"></div>
                                        <div class="form-error" id="newPassword-error"></div>
                                    </div>

                                    <div class="form-group">
                                        <label for="confirmPassword">Confirm New Password</label>
                                        <div class="password-input">
                                            <input type="password" 
                                                   id="confirmPassword" 
                                                   name="confirmPassword" 
                                                   placeholder="Confirm new password">
                                            <button type="button" class="password-toggle" onclick="togglePassword('confirmPassword')">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </div>
                                        <div class="form-error" id="confirmPassword-error"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">

                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="window.history.back()">
                                <i class="fas fa-times"></i>
                                Cancel
                            </button>
                            <button type="submit" class="btn btn-primary" id="saveBtn">
                                <i class="fas fa-save"></i>
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </main>

    <!-- Loading Overlay -->
    <div id="loadingOverlay" class="loading-overlay" style="display: none;">
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Updating profile...</p>
        </div>
    </div>

    <!-- Toast Container -->
    <div id="toast-container" class="toast-container"></div>

    <script>
        // Pass PHP data to JavaScript
        window.csrfToken = '<?= $_SESSION['csrf_token'] ?>';
        window.currentUser = <?= json_encode($user) ?>;
    </script>
</body>
</html>