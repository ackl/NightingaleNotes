// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "NightingaleNotes",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .library(
            name: "NightingaleNotes",
            targets: ["NightingaleNotes"]
        ),
    ],
    targets: [
        .target(
            name: "NightingaleNotes",
            path: "NightingaleNotes",
            exclude: ["NightingaleNotesApp.swift"],
            resources: [
                .copy("Resources/Sounds")
            ]
        ),
        .testTarget(
            name: "NightingaleNotesTests",
            dependencies: ["NightingaleNotes"],
            path: "Tests"
        ),
    ]
)
