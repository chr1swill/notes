function main() {
    const page = window.location.href + 'all-folders/';
    window.location.replace(`${page}`);
    console.debug("Redirect to uri: ", page);
}

main();
