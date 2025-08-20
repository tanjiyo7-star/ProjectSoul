<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SoulBridge - Connect with Friends</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="/assets/css/auth.css">
    <script src="/assets/js/auth.js" defer></script>
</head>
<body>
    <div class="auth-container">
        <div class="background-animation">
            <div class="floating-shape shape-1"></div>
            <div class="floating-shape shape-2"></div>
            <div class="floating-shape shape-3"></div>
            <div class="floating-shape shape-4"></div>
        </div>

        <div class="auth-content">
            <div class="auth-branding">
                <div class="brand-container">
                    <div class="brand-logo">
                        <img src="images/SB1.png" alt="SoulBridge" class="logo-image">
                        <h1 class="brand-title">SoulBridge</h1>
                    </div>
                    <p class="brand-subtitle">Connect with friends and the world around you on SoulBridge.</p>
                    <div class="feature-list">
                        <div class="feature-item">
                            <i class="fas fa-users"></i>
                            <span>Connect with friends</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-share-alt"></i>
                            <span>Share your moments</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-comments"></i>
                            <span>Chat in real-time</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Side - Forms -->
            <div class="auth-forms">
                <!-- Login Form -->
                <div id="login-form" class="form-container active">
                    <div class="form-card">
                        <div class="form-header">
                            <h2>Welcome Back</h2>
                            <p>Sign in to your account</p>
                        </div>

                        <form class="auth-form" method="POST" action="/authenticate" id="loginForm">
                            <div class="form-group">
                                <div class="input-wrapper">
                                    <i class="fas fa-envelope input-icon"></i>
                                    <input type="text" 
                                           name="email" 
                                           placeholder="Email or Username"
                                           class="form-input"
                                           required>
                                </div>
                                <div class="form-error" id="email-error"></div>
                            </div>
                            
                            <div class="form-group">
                                <div class="input-wrapper">
                                    <i class="fas fa-lock input-icon"></i>
                                    <input type="password" 
                                           name="password" 
                                           placeholder="Password"
                                           class="form-input"
                                           required>
                                    <button type="button" class="password-toggle" onclick="togglePassword('password')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                <div class="form-error" id="password-error"></div>
                            </div>

                            <div class="form-options">
                                <label class="remember-me">
                                    <input type="checkbox" name="remember_me" value="1">
                                    <span class="checkmark"></span>
                                    Remember me
                                </label>
                                <a href="#" class="forgot-password">Forgot password?</a>
                            </div>
                            
                            <button type="submit" class="btn btn-primary" name="login">
                                <span class="btn-text">Sign In</span>
                                <i class="fas fa-spinner btn-spinner" style="display: none;"></i>
                            </button>

                            <div class="form-divider">
                                <span>or</span>
                            </div>
                            
                            <button type="button" class="btn btn-secondary" onclick="showSignupForm()">
                                Create New Account
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Signup Form -->
                <div id="signup-form" class="form-container">
                    <div class="form-card">
                        <div class="form-header">
                            <h2>Join SoulBridge</h2>
                            <p>Create your account - it's free and easy</p>
                        </div>

                        <form class="auth-form" action="/authenticate" method="POST" id="signupForm">
                            <div class="form-row">
                                <div class="form-group">
                                    <div class="input-wrapper">
                                        <input type="text" 
                                               name="user_firstname" 
                                               placeholder="First name"
                                               class="form-input"
                                               required>
                                    </div>
                                    <div class="form-error" id="firstname-error"></div>
                                </div>
                                
                                <div class="form-group">
                                    <div class="input-wrapper">
                                        <input type="text" 
                                               name="user_lastname" 
                                               placeholder="Last name"
                                               class="form-input"
                                               required>
                                    </div>
                                    <div class="form-error" id="lastname-error"></div>
                                </div>
                            </div>

                            <div class="form-group">
                                <div class="input-wrapper">
                                    <i class="fas fa-envelope input-icon"></i>
                                    <input type="email" 
                                           name="email" 
                                           placeholder="Email address"
                                           class="form-input"
                                           required>
                                </div>
                                <div class="form-error" id="signup-email-error"></div>
                            </div>

                            <div class="form-group">
                                <div class="input-wrapper">
                                    <i class="fas fa-lock input-icon"></i>
                                    <input type="password" 
                                           name="password" 
                                           placeholder="Password (8+ characters)"
                                           class="form-input"
                                           required
                                           minlength="8">
                                    <button type="button" class="password-toggle" onclick="togglePassword('signup-password')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                <div class="password-strength" id="password-strength"></div>
                                <div class="form-error" id="signup-password-error"></div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Date of birth</label>
                                <div class="date-inputs">
                                    <select name="selectmonth" class="form-select" required>
                                        <option value="">Month</option>
                                        <option value="1">January</option>
                                        <option value="2">February</option>
                                        <option value="3">March</option>
                                        <option value="4">April</option>
                                        <option value="5">May</option>
                                        <option value="6">June</option>
                                        <option value="7">July</option>
                                        <option value="8">August</option>
                                        <option value="9">September</option>
                                        <option value="10">October</option>
                                        <option value="11">November</option>
                                        <option value="12">December</option>
                                    </select>
                                    <select name="selectday" class="form-select" required>
                                        <option value="">Day</option>
                                        <?php for($i = 1; $i <= 31; $i++): ?>
                                            <option value="<?= $i ?>"><?= $i ?></option>
                                        <?php endfor; ?>
                                    </select>
                                    <select name="selectyear" class="form-select" required>
                                        <option value="">Year</option>
                                        <?php for($i = date('Y'); $i >= 1900; $i--): ?>
                                            <option value="<?= $i ?>"><?= $i ?></option>
                                        <?php endfor; ?>
                                    </select>
                                </div>
                                <div class="form-error" id="birthdate-error"></div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Gender</label>
                                <div class="gender-options">
                                    <label class="gender-option">
                                        <input type="radio" name="gender" value="female" required>
                                        <span class="radio-custom"></span>
                                        Female
                                    </label>
                                    <label class="gender-option">
                                        <input type="radio" name="gender" value="male" required>
                                        <span class="radio-custom"></span>
                                        Male
                                    </label>
                                    <label class="gender-option">
                                        <input type="radio" name="gender" value="other" required>
                                        <span class="radio-custom"></span>
                                        Other
                                    </label>
                                </div>
                                <div class="form-error" id="gender-error"></div>
                            </div>

                            <div class="terms-agreement">
                                <p>By clicking Sign Up, you agree to our 
                                   <a href="#" class="terms-link">Terms</a>, 
                                   <a href="#" class="terms-link">Privacy Policy</a> and 
                                   <a href="#" class="terms-link">Cookies Policy</a>.
                                </p>
                            </div>

                            <button type="submit" class="btn btn-primary" name="signup">
                                <span class="btn-text">Create Account</span>
                                <i class="fas fa-spinner btn-spinner" style="display: none;"></i>
                            </button>

                            <div class="form-switch">
                                <p>Already have an account? 
                                   <a href="#" onclick="showLoginForm()" class="switch-link">Sign In</a>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Toast Notifications -->
    <div id="toast-container" class="toast-container"></div>
</body>
</html>