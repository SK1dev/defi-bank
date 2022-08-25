const hre = require('hardhat')
const fs = require('fs')

async function main() {

  const BankAccount = await hre.ethers.getContractFactory('BankAccount')
  const bankAccountContract = await BankAccount.deploy();
  const Matic = await hre.ethers.getContractFactory('Matic')
  const matic = await Matic.deploy();
  const Usdt = await hre.ethers.getContractFactory('Usdt')
  const usdt = await Usdt.deploy();

  const JointSavings = await hre.ethers.getContractFactory('JointSavings')
  const jointSavingsContract = await JointSavings.deploy();



  const Token = await hre.ethers.getContractFactory('Token')
  const tokenContract = await Token.deploy();
  const Loan = await hre.ethers.getContractFactory('Loan')
  const loanContract = await Loan.deploy();
  //change token's owner/minter from deployer to bankX
  await tokenContract.passMinterRole(loanContract.address);
  //pass token address for bankX contract(for future minting)
  await loanContract(tokenContract.address);



  
  await bankAccountContract.whitelistToken(
    hre.ethers.utils.formatBytes32String('Matic'),
    matic.address
  );
  await bankAccountContract.whitelistToken(
    hre.ethers.utils.formatBytes32String('Usdt'),
    usdt.address
  );
  await bankAccountContract.whitelistToken(
    hre.ethers.utils.formatBytes32String('Eth'),
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
  );

  fs.writeFileSync('./config.js', `
  export const bankAccountContractAddress = '${bankAccountContract.address}'
  export const maticAddress = '${matic.address}'
  export const usdtAddress = '${usdt.address}'
  export const jointSavingsContractAddress = '${jointSavingsContract.address}'
  export const loanContractAddress = '${loanContract.address}'
  export const tokenContractAddress = '${tokenContract.address}'
  
  `)

  console.log('BankAccount deployed to:', bankAccountContract.address)
  console.log('Matic deployed to:', matic.address)
  console.log('Tether deployed to:', usdt.address)
  console.log('JointSavings deployed to:', jointSavingsContract.address)
  console.log('Loan deployed to:', loanContract.address)
  console.log('Token deployed to:', tokenContract.address)

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });