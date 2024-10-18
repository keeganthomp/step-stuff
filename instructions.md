Here's the markdown version of the project description:

# Step Finance Staking Application

## Description

Create a Next.js application which allows a user to connect their Solana wallet and perform stake and unstake of the STEP token to the Step Staking program.

## Goals

- Application should allow a user to connect their Solana wallet using the Solana Standard Wallet Adapters.
- The UI should show a connected and disconnected state for the wallet.
- The disconnected state should ask the user to connect their wallet.
- The connected state should display the following information:
  - Connected wallet address
  - Balance of STEP and xSTEP tokens in wallet
  - A component which allows the user to stake and unstake the STEP token via the Step Staking program
- Staking program interaction should be done using the Anchor TS SDK.
- All actions done by the user such as wallet connect states and stake/unstake should display feedback notifications.
- The end product should match our V2 staking page (https://app.step.finance/en/stake), leaving out all side menu and nav bar items aside from the wallet connect button.

## Notes

- Estimated time required is 3 days of effort. We ask that you please complete the task within 1 week and communicate with us if you will take more time.
- Feel free to ask questions in Discord if you are blocked on something. Good communication is an important part of our dev process.
- This is primarily a dev task, but good UI/UX is also a skill we value, so extra effort put into the final polish of the app is appreciated.

## Resources

- [Step Finance Staking GitHub Repository](https://github.com/step-finance/step-staking)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [Step Finance Staking Page](https://app.step.finance/en/stake)
- XSTEP Program ID: `Stk5NCWomVN3itaFjLu382u9ibb5jMSHEsh6CuhaGjB