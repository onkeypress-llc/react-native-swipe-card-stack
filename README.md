# react-native-swipe-card-stack

React native implementation for displaying elements to swipe left or right on

## Installation

```sh
npm install react-native-swipe-card-stack
```

## Usage

```js
import { AnimatedSwipeStack } from 'react-native-swipe-card-stack';

// ...

<AnimatedSwipeStack
  loadData={() =>
    Promise.resolve(
      ['1', '2', '3', '4', '5'].map((v) => ({
        id: v + Date.now(),
      }))
    )
  }
  renderItem={(item) => <YourCardImplementation facility={item} />}
  width={width}
  height={height - 80}
  onItemApproved={(item) => console.log('approved', item)}
  onItemRejected={(item) => console.log('rejected', item)}
/>;
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
