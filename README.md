# glass-platform
Main glass library

## Dependencies
    https://github.com/krisnye/glass-build

## Setup
    git clone https://github.com/krisnye/glass-platform.git platform
    cd platform
    guild setup

## Development
    guild watch

## TODO
    - Using Render components which have a return value... via direct nesting would cause their dispose functions to not be executed. Need a solution to this.
    - Support Direct Nesting of Components AGAIN. Add Unit Tests to verify.
    X DataTable columns need to render entire cells. which is harder, I know.
    X createInput shouldn't have to take FieldProperties object. Simplify this.
    - Add firestore.FieldValue.serverTimestamp() sentinel values on create/update.

## App Engine Docs
    https://cloud.google.com/appengine/docs/standard/#instance_classes
    https://cloud.google.com/appengine/docs/standard/nodejs/config/appref
    https://googleapis.dev/nodejs/datastore/latest/index.html
