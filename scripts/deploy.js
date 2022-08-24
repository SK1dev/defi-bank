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
  const JointSavings = await ethers.getContractFactory("JointSavings", signer1);
  const jointSavingsContract = await JointSavings.deploy();
  fs.writeFileSync('./config.js', `
  export const bankAccountContractAddress = "${bankAccountContract.address} by ${signer1.address}"
  export const maticAddress = "${matic.address} by ${signer2.address}"
  export const usdtAddress = "${usdt.address} by ${signer2.address}"
  export const jointSavingsContractAddress = "${jointSavingsContract.address} by ${signer1.address}"
  `)

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
    '0x09B5DC75789389d1627879bA194874F459364859'
  );

  console.log("BankAccount deployed to:", bankAccountContract.address, "by", signer1.address);
  console.log("Matic deployed to:", matic.address, "by", signer2.address);
  console.log("Tether deployed to:", usdt.address, "by", signer2.address);
  console.log("JoinSavings deployed to:", jointSavingsContract.address, "by", signer1.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });