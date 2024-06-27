const SPACE = import.meta.env.CONTENTFUL_SPACE_ID
const TOKEN = import.meta.env.CONTENTFUL_DELIVERY_TOKEN
const PREVIEW_TOKEN = import.meta.env.CONTENTFUL_PREVIEW_TOKEN
const IS_PREVIEW = import.meta.env.IS_PREVIEW

const finalToken = IS_PREVIEW === 'true' ? PREVIEW_TOKEN : TOKEN;
const isPreview = IS_PREVIEW === 'true' ? true : false;

console.log(finalToken);
console.log(isPreview);

async function apiCall(query, variables) {
  const fetchUrl = `https://graphql.contentful.com/content/v1/spaces/${SPACE}/environments/master`;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${finalToken}`,
    },
    body: JSON.stringify({ query, variables }),
  }
  return await fetch(fetchUrl, options)
}

async function getAllBooks() {

  const query = `
    {
        bookReferencePageCollection(preview: ${isPreview}) {
          items {
            sys {
                id
            }
            title
            author {
              name
            }
            coverImage {
              url
            }
          }
        }
      }`;
  const response = await apiCall(query);
  const json = await response.json()
  return await json.data.bookReferencePageCollection.items;
}

async function getSingleBook(id) {
  const query = `
    query ($id: String!) {
        bookReferencePage(id: $id, preview: ${isPreview}) {
          title
          coverImage {
            url
          }
          description {
            json
          }
          author {
            sys {
              id
            }
            name
          }
        }
      }
    `;
  const variables = {
    id: id
  };
  const response = await apiCall(query, variables);
  const json = await response.json();
  return await json.data.bookReferencePage
}

async function getAuthor(id) {
  const query = `
    query ($id: String!) {
      bookAuthor(id:$id, preview: ${isPreview}) {
        name
        avatar {
          url
          description
        }
        bio {
          json
        }
        linkedFrom {
          bookReferencePageCollection {
            items {
              title
            }
          }
        }
      }
    }
    `;
  const variables = {
    id: id
  };
  const response = await apiCall(query, variables);
  const json = await response.json();
  return await json.data.bookAuthor
}

export const client = { getAllBooks, getSingleBook, getAuthor }
