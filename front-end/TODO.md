# Refactor Long Tailwind Classes to Custom Classes

## Steps to Complete:

- [ ] Step 1: Update src/index.css - Add @layer components {} with all custom classes (spinner, action-icon-{color}, btn-primary/danger/purple, input-field, search-input, error-alert, success-alert, card, modal-overlay, gradient-bg, home-btn, border-btn, checkbox, badge-owner, file-img, desc-text, and others for repeated patterns).

- [ ] Step 2: Edit src/pages/History.jsx - Replace long classNames for action icons (green/blue/red/gray/purple), loading spinner, error alerts.

- [ ] Step 3: Edit src/pages/TaskDetail.jsx - Replace long classNames for buttons (primary/danger/purple), badges, file images, description text, alerts, spinner.

- [ ] Step 4: Edit src/pages/Tasks.jsx - Replace long classNames for search input, error alert, loading spinner, create button.

- [ ] Step 5: Edit src/components/tasks/TaskCard.jsx - Replace long classNames for card container, edit/delete links, modal buttons.

- [ ] Step 6: Edit src/components/auth/RegisterForm.jsx - Replace long classNames for form container, inputs, submit button, error alert.

- [ ] Step 7: Edit src/components/auth/LoginForm.jsx - Replace long classNames for inputs, submit button, error alert (similar to RegisterForm).

- [ ] Step 8: Edit src/components/tasks/PermissionModal.jsx - Replace long classNames for alerts (error/success), inputs, checkboxes, close button.

- [ ] Step 9: Edit src/components/ui/Modal.jsx - Replace long classNames for overlay, close button.

- [ ] Step 10: Edit src/pages/Home.jsx - Replace long classNames for gradient background, home buttons.

- [ ] Step 11: Edit src/App.jsx - Replace long classNames for loading spinner.

- [ ] Step 12: Edit remaining files (e.g., src/pages/TaskCreate.jsx, src/components/tasks/TaskForm.jsx, src/components/layout/Header.jsx) for any long classNames.

- [ ] Step 13: Verify changes - Run `npm run dev`, check UI for styling consistency, responsive/hover/focus states; fix any breakage.

- [ ] Step 14: Complete task - Update TODO.md with all [x], attempt completion.
