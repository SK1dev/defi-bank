const hre = require("hardhat");
import { ethers } from "hardhat";

async function main() {
  [signer1, signer2] = await ethers.getSigners();

  const Bank = await ethers.getContractFactory("Bank", signer1);
  const bankContract = await Bank.deploy();

  const Matic = await ethers.getContractFactory("Matic", signer2);
  const matic = await Matic.deploy();

  const Usdt = await ethers.getContractFactory("Usdt", signer2);
  const usdt = await Usdt.deploy();

  await bankContract.whitelistToken(
    ethers.utils.formatBytes32String('Matic'),
    matic.address
  );

  await bankContract.whitelistToken(
    ethers.utils.formatBytes32String('Usdt'),
    usdt.address
  );
  await bankContract.whitelistToken(
    ethers.utils.formatBytes32String('Eth'),
    ''
  );

  console.log("Bank deployed to:", bankContract.address, "by", signer1.address);
  console.log("Matic deployed to:", matic.address, "by", signer2.address);
  console.log("Tether deployed to:", usdt.address, "by", signer2.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });