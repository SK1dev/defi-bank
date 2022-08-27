const hre = require("hardhat");
const fs = require('fs');

async function main() {
  [signer1, signer2] = await ethers.getSigners();

  const BankAccount = await ethers.getContractFactory("BankAccount", signer1);
  const bankAccountContract = await BankAccount.deploy();

  const Matic = await ethers.getContractFactory("Matic", signer2);
  const matic = await Matic.deploy();
  const Usdt = await ethers.getContractFactory("Usdt", signer2);
  const usdt = await Usdt.deploy();

  await bankAccountContract.whitelistToken(
    ethers.utils.formatBytes32String('Matic'),
    matic.address
  );
  await bankAccountContract.whitelistToken(
    ethers.utils.formatBytes32String('Usdt'),
    usdt.address
  );
  await bankAccountContract.whitelistToken(
    ethers.utils.formatBytes32String('Eth'),
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
  );

  fs.writeFileSync('./config.js', `
  export const bankAccountContractAddress = "${bankAccountContract.address}"
  export const maticAddress = "${matic.address}"
  export const usdtAddress = "${usdt.address}"
  
  `)

  console.log("BankAccount deployed to:", bankAccountContract.address, "by", signer1.address);
  console.log("Matic deployed to:", matic.address, "by", signer2.address);
  console.log("Tether deployed to:", usdt.address, "by", signer2.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });