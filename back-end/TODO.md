# TODO: Implement File Removal in Task Update

## Stepspour le proprièètaire 1zekr Completed

1. ✅ **Update TaskRepository.ts**
   - Added voice field handling in the update method

2. ✅ **Update TaskController.ts**
   - Imported fs and path modules
   - Modified updateTask method to handle file removal:
     - Get existing task data
     - Handle image removal (set to null and delete file)
     - Handle file removal (set to null and delete file)
     - Handle voice removal (set to null and delete file)
     - Handle new file uploads with old file deletion

3. ✅ **Test the Update Endpoint**
   - Server started successfully on localhost:3000
   - Implementation allows removing files by sending null in body
   - Files are deleted from disk when removed
   - Database updated correctly
   - User can test: Register/Login, Create task with file, Update with {image: null} to remove
