# Integration Script Tag - Example

## Script Tag Format

The script tag uses a `data-project-id` attribute to specify your project:

```html
<script 
  async 
  src="http://localhost:3001/tracker.js" 
  data-project-id="abc123xyz">
</script>
```

## Benefits

✅ **Clean & Semantic** - Uses standard HTML data attributes
✅ **Easy to Read** - Multi-line format is clear and maintainable
✅ **Easy to Copy** - Users can quickly copy and paste
✅ **Project-Specific** - The project ID is embedded as a data attribute
✅ **Async Loading** - Won't block page rendering

## How It Works

1. The tracker script includes a `data-project-id` attribute with your unique project ID
2. The `async` attribute ensures the script loads without blocking page rendering
3. When the tracker.js file loads, it reads the project ID from its own script tag's data attribute
4. All tracking events are automatically associated with the correct project

## Example Usage

Add this script to the `<head>` section of your website:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
  <script 
    async 
    src="http://localhost:3001/tracker.js" 
    data-project-id="abc123xyz">
  </script>
</head>
<body>
  <!-- Your content here -->
</body>
</html>
```

That's it! The tracking will start automatically once the page loads.
