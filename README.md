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

## App Engine Docs
    https://cloud.google.com/appengine/docs/standard/#instance_classes
    https://cloud.google.com/appengine/docs/standard/nodejs/config/appref
    https://googleapis.dev/nodejs/datastore/latest/index.html

## Cordova
    I got this error when running "cordova emulate android"

    Waiting for emulator to start...
    PANIC: Missing emulator engine program for 'x86' CPU.
    I did this: (Not sure it helped)
        https://stackoverflow.com/questions/55204871/panic-missing-emulator-engine-program-for-x86-cpu-windows-10

    Then I did added this to my ~/.bash_profile and it worked:

        export ANDROID_SDK_ROOT=~/Library/Android/sdk
        export PATH=$ANDROID_SDK_ROOT/emulator:$ANDROID_SDK_ROOT/tools:$PATH

    Hot reloading? https://stackoverflow.com/questions/46262816/cordova-hot-reloading-on-device-without-ionic

## Coordinate System
    The default coordinate system is right handed with +z pointing towards the viewer.
    The 2d control coordinate system is also right handed with the origin in the top left and the +z pointing away from the viewer.
    The projection transformation turns it into a left handed system as +z points away from the viewer.

    modelView = view.multiply(model)

    model space
        -> model
    world space
        -> view
    camera space
        -> projection
    clip space
        -> screen
    screen space

## Todo
    X   Change default2D shader to actually use modelViewProjection matrix.
    X   Change Scene to Screen and make it set the Projection Matrix to 2D.
    X   Create a View or Camera class to handle the View Matrix.
    X   Created horizontal and vertical flex layout.
    X   Handle Virtual Node Transforms using Matrices.
    X   Use Transforms while Picking to transform the Pick Capsule.
    X   Use Transform as LocalTransform for Control.
    X   Create and use an arbitrary Transform Node and test input.
        Sprites and Image Usage in 2D and 3D.
    X   2D Canvas usage from within 3D.
        Text Rendering within Canvas 2D.
        3D Effects.

        GLTF Loader needs to use the new Mesh class.
    
        Need ability to create/delete a Texture and update it's src
        Move the field upload implementation into the general platform data/download
        -> Actually, define new ?query as ?{query} or ?path/to/field
        -> Then merge the get/put semantics into ?data url with special upload/download of data fields
