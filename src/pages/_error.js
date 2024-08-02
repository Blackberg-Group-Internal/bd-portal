import Link from 'next/link';

function Custom404Page() {

  return (
    <>
        <section id="custom-404" className="container-fluid py-8 py-md-11">
            <div className="container">
              <div className="row">
                <div className="col-12 col-md-7 text-center mx-auto py-5 my-5">
                  <h1>{"Sorry, we couldn't find what you were looking for."}</h1>
                  <h5 className="my-4">{"Let's go back to the home page and try again."}</h5>
                  <Link href="/" className="btn btn-primary">
                      Back To Home
                  </Link>
                </div>
              </div>
            </div>
        </section>
    </>
  );
}

export async function getServerSideProps() {
  
    return {
      props: { 
          navStyle: "light", 
          footerCta: true
        },
    };
}

export default Custom404Page;