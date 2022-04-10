//import LibraryABI from './libraryABI'

let account = null
let libraryContract
let bookRentContract = null


export const accountAddress = () => {
  return account
}

export function getTronWeb() {
  // Obtain the tronweb object injected by tronLink 
  var obj = setInterval(async () => {
    if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
      clearInterval(obj)
      console.log("tronWeb successfully detected!")
    }
  }, 10)
  setTimeout('', 3000);
}


export async function setLibraryContract(libraryContractAddress) {
  // TODO: abtain contract Object
  // const libraryContractAddress = libraryConfig.libraryContractAddress;
  console.log("libraryContractAddress: " + libraryContractAddress);
  bookRentContract = await window.tronWeb.contract().at(libraryContractAddress);
}


export async function postBookInfo(name, description, price) {
  // TODO: call addBook func of library contract

  const result = await bookRentContract.addBook(name, description, price).send({
    feeLimit: 100_000_000,
    callValue: 0,
    shouldPollResponse: true
  });

  alert('Book Posted Successfully')

}

export async function borrowBook(spaceId, checkInDate, checkOutDate, totalPrice) {
  // TODO: call borrowBook func of library contract

  const result = await bookRentContract.borrowBook(spaceId, checkInDate, checkOutDate).send({
    feeLimit: 100_000_000,
    callValue: totalPrice,
    shouldPollResponse: true
  });

  alert('Property Booked Successfully')
}

export async function fetchAllBooks() {
  // TODO: call bookId func of library contract to abtain total books number
  // iterate till book Id
  // push each object to books array
  const books = [];

  const bookId = await bookRentContract.bookId().call();
  //iterate from 0 till bookId
  for (let i = 0; i < bookId; i++) {
    const book = await bookRentContract.books(i).call()
    if (book.name != "") // filter the deleted books
    {
      // console.log(`book ${i}: ${JSON.stringify(book)}`);
      books.push(
        { id: i, name: book.name, description: book.description, available: book.valid, price: window.tronWeb.fromSun(book.price) }
      )
    }
  }
  console.log(`books: ${JSON.stringify(books)}`);
  return books

}
