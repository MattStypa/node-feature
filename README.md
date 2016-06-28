# Feature

Feature is a rampup and AB testing library for Node. It is a port of our Laravel library and has a very similar functionality.

## How to use

```
var Feature = require('node-feature');

var featureConfiguration = {
    featureA: {
        variantA: 10,
        variantB: 10,
        variantC: 80
    },
    featureB: [
        'variantA',
        'variantB'
    ],
    featureC: 50
};

var features = Feature(featureConfiguration, sessionHash, overrides);
```

At this point features object will consist of all defined features and their selected variants.

```
{
    featureA: 'variantC',
    featureB: 'variantA',
    featureC: null,
}
```

### Feature Configuration

Each feature can have any number of variants with each variant defining its own odds.

```
{
    feature: {
        variantA: 25,
        variantB: 25,
        variantC: 50
    }
}
```

In the above example, each variant has the specified chance of being selected. Variants with odds below 0 are normalized to 0. The variants are processed top to bottom. If the sum of odds exceeds 100 the feature is saturated and any variants above that threshold have no chance of being selected.

```
{
    feature: {
        variantA: 100,
        variantB: 25,
        variantC: 50
    }
}
```

The above feature will always return variantA.

You can omit the odds and just specify the variants. In this case, the variants are evenly spread out.

```
{
    feature: [
        'variant_a',
        'variant_b'
    ]
}
```

In this case, both variants have 50% chance of being selected.

To specify a simple ON/OFF feature we just include a single variant.

```
{
    feature: {
        enabled: 100
    }
}
```

This feature is always on. We can adjust the odds to turn it off completely or achieve a ramp-up functionality.

It is also possible to shorten the above example by just defining the odds for the feature itself.

```
{
    feature: 50
}
```

This feature will be on for 50% of the users.

### Session Hash

The second argument identifies the session. It is used to determine the selected variants.

### Overrides

The third argument allows for visitors to override the variants. This is used during testing. It's a good idea to restrict this only to specific users.

This can be either a JSON object or a JSON string that specifies the feature and its variant.

```
{
    featureA: 'variantB',
}
```

This will force the FeatureA to use VariantB.

You can also pass a comma separated list of features and variants.

```
featureA:variantA,featureB:variantA
```

This will force featureA and featureB to both return variantA.
