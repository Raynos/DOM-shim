# Examples

Contains 3 examples of varying complexity.
## Format
Each directory contains a build script with both CLI code and standard js code included.
Running `build.js` via `node` (or its included cli command) will generate `output.js`.
Browser behaviour can be tested by loading `test.html` in the browser (includes `output.js`).

### Minimal Example
Simply analyses from an entry point and loads resources from a `shared` domain.
If it works, what is required from the `shared` domain will be sent to `alert`.

### Simple Example
jQuery integration using arbiters for the global variable and waits for the DOM with the `jQuery()` function.
It also contains a sample MVC application structure. That it funnels some data through.

    app::app
     ├──┬app::controllers/users
     │  └──┬app::models/user
     │     └───app::utils/validation
     └───M8::jQuery

If it works, data is passed from model/user via validation down to app::app, and to prove that the domloader works with arbiters,
it outputs the result in a dom element.

### Advanced Example
Uses a bunch of stuff. Adds in a custom library, arbiters it. Loads in data from a file attaches it to the data domain.
Changes the default namespace, and does not wait for the DOM. Also cuts out tests from files (in particular dependencies from app::helper does not get included.)

app::main
├───app::helper
├──┬app::bigthing/sub1
│  └───app::bigthing/sub2
├──┬shared::validation
│  └───shared::calc
└───M8::monolith

If it works, a bunch of stuff will be logged to console, and no errors will show up.
